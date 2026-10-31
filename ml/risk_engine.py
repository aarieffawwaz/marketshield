"""
Satellite risk engine: predict thermal (eruptive) activity at Indonesian volcanoes in the next 7 days
from this week's satellite signals, with XGBoost and real SHAP explanations.

Why a satellite label: PVMBG's alert-level history is not available in machine-readable form tonight, so the
target is an objective proxy that anyone can recompute from Earth Engine: whether NASA FIRMS detects at least one
thermal hotspot within 5 km of the summit in the following week. This is NOT the official PVMBG level.

Data (Google Earth Engine), weekly from 2019 to 2026 for every volcano in ml/data/volcanoes.json:
  firms_now      FIRMS hotspot fraction within 5 km, this week          (MODIS/VIIRS thermal anomalies)
  firms_prev3w   FIRMS hotspot fraction within 5 km, previous 3 weeks
  so2_now        Sentinel-5P SO2 column within 20 km, this week          (COPERNICUS/S5P/OFFL/L3_SO2)
  so2_ratio      so2_now / previous 3 weeks
  s1_change_db   Sentinel-1 VV backscatter change within 10 km, last 12 days vs 24 days before
  rain_7d_mm     GPM IMERG rainfall within 10 km, this week
Label: firms_next > 0 (any hotspot next week).

Evaluation: time split (train 2019-2023, test 2024-2026), compared with a persistence baseline
("next week looks like this week"), and separately on onset weeks (no hotspot this week), where persistence
always says "no" and only the satellite signals can help.

Run: python ml/risk_engine.py --project <earth-engine-project> --out ml/results
"""
import argparse, json, os, time
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import pandas as pd

HERE = os.path.dirname(__file__)
FEATURES = ["firms_now", "firms_prev3w", "so2_now", "so2_ratio", "s1_change_db", "rain_7d_mm"]
NAMES = {"firms_now": "Titik panas minggu ini", "firms_prev3w": "Titik panas 3 minggu lalu", "so2_now": "SO2 minggu ini",
         "so2_ratio": "Tren SO2", "s1_change_db": "Backscatter S1", "rain_7d_mm": "Hujan 7 hari"}


def week_features(ee, vols, start):
    w0 = ee.Date(start); w1 = w0.advance(7, "day")
    firms = ee.ImageCollection("FIRMS").select("T21")
    hot = lambda a, b: firms.filterDate(a, b).map(lambda i: i.gt(0).unmask(0)).max().unmask(0)
    so2c = ee.ImageCollection("COPERNICUS/S5P/OFFL/L3_SO2").select("SO2_column_number_density")
    so2_now = so2c.filterDate(w0, w1).mean().unmask(0)
    so2_prev = so2c.filterDate(w0.advance(-21, "day"), w0).mean().unmask(0)
    s1 = ee.ImageCollection("COPERNICUS/S1_GRD").filter(ee.Filter.eq("instrumentMode", "IW")).filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VV")).select("VV")
    s1_recent = s1.filterDate(w1.advance(-12, "day"), w1).mean()
    s1_base = s1.filterDate(w1.advance(-36, "day"), w1.advance(-12, "day")).mean()
    rain = ee.ImageCollection("NASA/GPM_L3/IMERG_V07").select("precipitation").filterDate(w0, w1).sum().multiply(0.5)
    near = vols.map(lambda f: f.buffer(5000))
    mid = vols.map(lambda f: f.buffer(10000))
    far = vols.map(lambda f: f.buffer(20000))
    r = ee.Reducer.mean()
    a = hot(w0, w1).rename("firms_now").addBands(hot(w0.advance(-21, "day"), w0).rename("firms_prev3w")) \
        .addBands(hot(w1, w1.advance(7, "day")).rename("firms_next")).reduceRegions(near, r, 1000)
    b = so2_now.rename("so2_now").addBands(so2_prev.rename("so2_prev")).reduceRegions(far, r, 5000)
    c = s1_recent.subtract(s1_base).rename("s1_change_db").addBands(rain.rename("rain_7d_mm")).reduceRegions(mid, r, 500)
    return a, b, c


def fetch(project, vols_json, start, end, workers=6):
    import ee
    ee.Initialize(project=project)
    feats = [ee.Feature(ee.Geometry.Point([v["lon"], v["lat"]]), {"volcano": v["name"]}) for v in vols_json]
    vols = ee.FeatureCollection(feats)
    weeks = pd.date_range(start, end, freq="7D")

    def one(w):
        for attempt in range(3):
            try:
                a, b, c = week_features(ee, vols, w.strftime("%Y-%m-%d"))
                out = {}
                for fc in (a, b, c):
                    for f in fc.getInfo()["features"]:
                        out.setdefault(f["properties"]["volcano"], {}).update({k: v for k, v in f["properties"].items() if k != "volcano"})
                return [{"week": w.strftime("%Y-%m-%d"), "volcano": k, **v} for k, v in out.items()]
            except Exception as e:  # transient EE errors: retry
                if attempt == 2:
                    print("failed", w.date(), str(e)[:120]); return []
                time.sleep(3)

    rows, t0 = [], time.time()
    with ThreadPoolExecutor(workers) as ex:
        for i, r in enumerate(ex.map(one, weeks), 1):
            rows += r
            if i % 25 == 0:
                print(f"weeks {i}/{len(weeks)} ({time.time() - t0:.0f}s)", flush=True)
    return pd.DataFrame(rows)


def train(df, out):
    import xgboost as xgb, shap
    from sklearn.metrics import average_precision_score, f1_score, precision_score, recall_score, roc_auc_score
    df = df.copy()
    df["so2_ratio"] = (df["so2_now"] + 1e-6) / (df["so2_prev"] + 1e-6)
    df["y"] = (df["firms_next"] > 0).astype(int)
    df = df.dropna(subset=FEATURES + ["y"])
    df["week"] = pd.to_datetime(df["week"])
    tr, te = df[df.week < "2024-01-01"], df[df.week >= "2024-01-01"]
    pos = tr.y.mean()
    model = xgb.XGBClassifier(n_estimators=300, max_depth=4, learning_rate=0.05, subsample=0.9, colsample_bytree=0.9,
                              scale_pos_weight=(1 - pos) / max(pos, 1e-6), eval_metric="aucpr", random_state=42)
    model.fit(tr[FEATURES], tr.y)
    p = model.predict_proba(te[FEATURES])[:, 1]
    persist = (te.firms_now > 0).astype(int).values

    def block(y, prob, pred):
        return {"n": int(len(y)), "positives": int(y.sum()),
                "roc_auc": round(roc_auc_score(y, prob), 4) if y.nunique() > 1 else None,
                "pr_auc": round(average_precision_score(y, prob), 4) if y.nunique() > 1 else None,
                "precision": round(precision_score(y, pred, zero_division=0), 4), "recall": round(recall_score(y, pred, zero_division=0), 4),
                "f1": round(f1_score(y, pred, zero_division=0), 4)}

    onset = (te.firms_now == 0).values
    res = {
        "target": "any FIRMS thermal hotspot within 5 km of the summit in the next 7 days (proxy, not the PVMBG level)",
        "data": {"volcanoes": int(df.volcano.nunique()), "weeks": int(df.week.nunique()), "rows": int(len(df)),
                 "train_rows": int(len(tr)), "test_rows": int(len(te)), "train_period": "2019-2023", "test_period": "2024-2026",
                 "positive_rate_train": round(float(pos), 4), "positive_rate_test": round(float(te.y.mean()), 4)},
        "xgboost_test": block(te.y, p, (p >= 0.5).astype(int)),
        "persistence_baseline_test": block(te.y, persist.astype(float), persist),
        "onset_weeks_test": {"xgboost": block(te.y[onset], p[onset], (p[onset] >= 0.5).astype(int)),
                             "persistence": "always predicts no activity on these weeks"},
    }
    sv = shap.TreeExplainer(model).shap_values(te[FEATURES])
    imp = pd.Series(np.abs(sv).mean(0), index=FEATURES).sort_values(ascending=False)
    res["shap_mean_abs"] = {k: round(float(v), 4) for k, v in imp.items()}
    model.save_model(f"{out}/risk_xgboost.json")
    df.to_csv(f"{out}/risk_dataset.csv", index=False)
    json.dump(res, open(f"{out}/risk_metrics.json", "w"), indent=2)
    plot(res, te, p, imp, out)
    # Latest forecast per volcano for the app (current week's features)
    last = df.sort_values("week").groupby("volcano").tail(1)
    lp = model.predict_proba(last[FEATURES])[:, 1]
    lsv = shap.TreeExplainer(model).shap_values(last[FEATURES])
    latest = []
    for (_, row), prob, s in zip(last.iterrows(), lp, lsv):
        top = [NAMES[FEATURES[i]] for i in np.argsort(-np.abs(s))[:3]]
        latest.append({"volcano": row.volcano, "week": row.week.strftime("%Y-%m-%d"), "p": round(float(prob), 4), "top": top})
    json.dump(latest, open(f"{out}/risk_latest.json", "w"), indent=2)
    return res


def plot(res, te, p, imp, out):
    import matplotlib; matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from sklearn.metrics import precision_recall_curve, roc_curve
    maroon, ember, sand = "#7B1E26", "#EA6A1F", "#F3EAE1"
    fig, ax = plt.subplots(1, 3, figsize=(15, 4.4), dpi=160)
    fpr, tpr, _ = roc_curve(te.y, p); ax[0].plot(fpr, tpr, color=maroon, lw=2, label=f"XGBoost AUC {res['xgboost_test']['roc_auc']}")
    ax[0].plot([0, 1], [0, 1], "--", color="#bbb"); ax[0].set_title("ROC · test 2024–2026"); ax[0].set_xlabel("false positive rate"); ax[0].set_ylabel("true positive rate"); ax[0].legend(loc="lower right")
    pr, rc, _ = precision_recall_curve(te.y, p); ax[1].plot(rc, pr, color=maroon, lw=2, label=f"XGBoost AP {res['xgboost_test']['pr_auc']}")
    pb = res["persistence_baseline_test"]; ax[1].scatter([pb["recall"]], [pb["precision"]], color=ember, zorder=3, label="persistence baseline")
    ax[1].set_title("Precision–recall · test"); ax[1].set_xlabel("recall"); ax[1].set_ylabel("precision"); ax[1].legend(loc="lower left")
    ax[2].barh([n for n in imp.index[::-1]], imp.values[::-1], color=maroon); ax[2].set_title("SHAP · mean |impact|")
    for a in ax: a.spines[["top", "right"]].set_visible(False)
    fig.tight_layout(); fig.savefig(f"{out}/risk_results.png"); plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--start", default="2019-01-07")
    ap.add_argument("--end", default="2026-10-19")
    ap.add_argument("--out", default="ml/results")
    ap.add_argument("--cache", default="")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    vols = json.load(open(os.path.join(HERE, "data", "volcanoes.json")))
    if a.cache and os.path.exists(a.cache):
        df = pd.read_csv(a.cache)
    else:
        df = fetch(a.project, vols, a.start, a.end)
        if a.cache: df.to_csv(a.cache, index=False)
    print("rows", len(df))
    print(json.dumps(train(df, a.out), indent=1))


if __name__ == "__main__":
    main()

"""
Fine-tune IndoBERT to tell Indonesian hoax messages from factual ones, with an honest evaluation.

Data: mzuama/IndonesianHoaxdetection on Hugging Face (Label 1 = hoax, 0 = fact; texts are lower-cased
and stripped of punctuation by the dataset author). Steps:
  1. drop empty and duplicate texts *before* splitting, so no text appears in both train and test
  2. stratified split 80 / 10 / 10 (train / validation / test), fixed seed
  3. baseline: TF-IDF (word 1-2 grams) + logistic regression
  4. IndoBERT (indobenchmark/indobert-base-p1) fine-tuned for a few epochs, best epoch picked on validation
  5. report accuracy, precision, recall, F1 on the untouched test split, plus on its disaster-related subset
  6. --crop-aug adds a short copy (first 8-30 words) of every training text: the dataset is article-length, while
     chain messages are short, and without this the model treats almost any short text as a hoax
  8. --domain-aug adds ml/data/domain_short_messages.csv (60 short disaster messages written by the team, different
     events and wording from the probe set) to the training data only
  7. also report results on short crops of the test split and on ml/data/probe_short_messages.csv
     (40 short disaster messages written by the team; never used for training)

Run:  python ml/train_hoax.py --epochs 2 --out ml/results
"""
import argparse, json, os, random, re, time
import numpy as np
import pandas as pd
import torch
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer, get_linear_schedule_with_warmup

DATASET = "mzuama/IndonesianHoaxdetection"
MODEL = "indobenchmark/indobert-base-p1"
LABELS = ["FAKTA", "HOAKS"]
DOMAIN = os.path.join(os.path.dirname(__file__), "data", "domain_short_messages.csv")
PROBE = os.path.join(os.path.dirname(__file__), "data", "probe_short_messages.csv")
DISASTER = re.compile(r"\b(gunung|erupsi|letusan|meletus|lahar|abu vulkanik|gempa|tsunami|banjir|longsor|bencana|bnpb|bpbd|pvmbg|bmkg|evakuasi|merapi|semeru|sinabung|agung)\b")


def normalise(t):
    """Match the dataset's preprocessing: lower-case, no URLs/mentions/hashtags, letters and digits only."""
    t = re.sub(r"http\S+|@\w+|#\w+", "", str(t).lower())
    return re.sub(r"\s+", " ", re.sub(r"[^0-9a-z ]", " ", t)).strip()


def crop(df, seed, lo=8, hi=30):
    rng = random.Random(seed)
    out = df.copy()
    out["text"] = [" ".join(t.split()[: rng.randint(lo, hi)]) for t in df["text"]]
    return out[out["text"].str.split().str.len() >= 6]


def seed_all(s):
    random.seed(s); np.random.seed(s); torch.manual_seed(s)


def load_data(seed):
    from datasets import load_dataset
    df = load_dataset(DATASET, split="train").to_pandas().rename(columns={"Text": "text", "Label": "label"})
    n_raw = len(df)
    df["text"] = df["text"].astype(str).str.strip()
    df = df[df["text"].str.len() > 20]
    df = df.drop_duplicates("text")
    df = df[df["label"].isin([0, 1])].reset_index(drop=True)
    train, rest = train_test_split(df, test_size=0.2, stratify=df["label"], random_state=seed)
    val, test = train_test_split(rest, test_size=0.5, stratify=rest["label"], random_state=seed)
    info = {"rows_raw": n_raw, "rows_clean": len(df), "train": len(train), "validation": len(val), "test": len(test),
            "label_counts": {LABELS[k]: int(v) for k, v in df["label"].value_counts().sort_index().items()}}
    return train.reset_index(drop=True), val.reset_index(drop=True), test.reset_index(drop=True), info


def metrics(y, p):
    pr, rc, f1, _ = precision_recall_fscore_support(y, p, average="binary", pos_label=1, zero_division=0)
    _, _, f1m, _ = precision_recall_fscore_support(y, p, average="macro", zero_division=0)
    return {"accuracy": round(accuracy_score(y, p), 4), "precision_hoax": round(pr, 4), "recall_hoax": round(rc, 4),
            "f1_hoax": round(f1, 4), "f1_macro": round(f1m, 4), "n": int(len(y))}


class TextDS(Dataset):
    def __init__(self, df, tok, max_len):
        self.enc = tok(df["text"].tolist(), truncation=True, max_length=max_len, padding="max_length", return_tensors="pt")
        self.y = torch.tensor(df["label"].values, dtype=torch.long)
    def __len__(self):
        return len(self.y)
    def __getitem__(self, i):
        return {k: v[i] for k, v in self.enc.items()}, self.y[i]


@torch.no_grad()
def predict(model, loader, device):
    model.eval(); out = []
    for x, _ in loader:
        out.append(torch.softmax(model(**{k: v.to(device) for k, v in x.items()}).logits, -1)[:, 1].cpu())
    return torch.cat(out).numpy()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--epochs", type=int, default=2)
    ap.add_argument("--max-len", type=int, default=128)
    ap.add_argument("--batch", type=int, default=32)
    ap.add_argument("--lr", type=float, default=3e-5)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", default="ml/results")
    ap.add_argument("--save-model", default="")
    ap.add_argument("--crop-aug", action="store_true")
    ap.add_argument("--domain-aug", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    seed_all(a.seed)
    device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
    t0 = time.time()

    train, val, test, info = load_data(a.seed)
    test_dis = test["text"].str.contains(DISASTER)
    info["test_disaster_subset"] = int(test_dis.sum())
    test_short = crop(test, a.seed + 1)
    probe = pd.read_csv(PROBE)
    probe["text"] = probe["text"].map(normalise)
    info["test_short_crops"] = len(test_short)
    info["probe_messages"] = len(probe)
    if a.crop_aug:
        train = pd.concat([train, crop(train, a.seed)], ignore_index=True).sample(frac=1, random_state=a.seed).reset_index(drop=True)
        info["train_with_crops"] = len(train)
    if a.domain_aug:
        dom = pd.read_csv(DOMAIN); dom["text"] = dom["text"].map(normalise)
        # repeat the small in-domain set so it is not drowned out by ~19k article rows
        train = pd.concat([train] + [dom] * 5, ignore_index=True).sample(frac=1, random_state=a.seed).reset_index(drop=True)
        info["train_with_domain"] = len(train)
    print("data:", json.dumps(info))

    # Baseline
    vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True, max_features=200_000)
    lr = LogisticRegression(max_iter=2000, C=4.0).fit(vec.fit_transform(train["text"]), train["label"])
    p_base = lr.predict(vec.transform(test["text"]))
    baseline = {"test": metrics(test["label"], p_base), "test_disaster": metrics(test.loc[test_dis, "label"], p_base[test_dis.values]),
                "test_short": metrics(test_short["label"], lr.predict(vec.transform(test_short["text"]))),
                "probe": metrics(probe["label"], lr.predict(vec.transform(probe["text"])))}
    print("baseline:", json.dumps(baseline))

    # IndoBERT
    tok = AutoTokenizer.from_pretrained(MODEL)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL, num_labels=2, id2label=dict(enumerate(LABELS)), label2id={l: i for i, l in enumerate(LABELS)}).to(device)
    dl_tr = DataLoader(TextDS(train, tok, a.max_len), batch_size=a.batch, shuffle=True)
    dl_va = DataLoader(TextDS(val, tok, a.max_len), batch_size=64)
    dl_te = DataLoader(TextDS(test, tok, a.max_len), batch_size=64)
    dl_ts = DataLoader(TextDS(test_short, tok, a.max_len), batch_size=64)
    dl_pr = DataLoader(TextDS(probe, tok, a.max_len), batch_size=64)
    opt = torch.optim.AdamW(model.parameters(), lr=a.lr, weight_decay=0.01)
    steps = a.epochs * len(dl_tr)
    sch = get_linear_schedule_with_warmup(opt, int(0.06 * steps), steps)
    log, best, best_state = [], -1.0, None
    for ep in range(1, a.epochs + 1):
        model.train(); running, n = 0.0, 0
        for i, (x, y) in enumerate(dl_tr, 1):
            loss = model(**{k: v.to(device) for k, v in x.items()}, labels=y.to(device)).loss
            loss.backward(); torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step(); sch.step(); opt.zero_grad()
            running += loss.item(); n += 1
            if i % 50 == 0:
                print(f"epoch {ep} step {i}/{len(dl_tr)} loss {running / n:.4f} ({time.time() - t0:.0f}s)", flush=True)
        pv = predict(model, dl_va, device)
        vm = metrics(val["label"], (pv >= 0.5).astype(int))
        log.append({"epoch": ep, "train_loss": round(running / n, 4), **{f"val_{k}": v for k, v in vm.items()}})
        print("epoch", ep, json.dumps(log[-1]), flush=True)
        if vm["f1_macro"] > best:
            best = vm["f1_macro"]; best_state = {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
    model.load_state_dict(best_state)

    pt = predict(model, dl_te, device)
    pred = (pt >= 0.5).astype(int)
    result = {
        "model": MODEL, "dataset": DATASET, "device": device, "seed": a.seed,
        "hyperparameters": {"epochs": a.epochs, "max_len": a.max_len, "batch": a.batch, "lr": a.lr},
        "data": info,
        "baseline_tfidf_logreg": baseline,
        "indobert": {"test": metrics(test["label"], pred), "test_disaster": metrics(test.loc[test_dis, "label"], pred[test_dis.values]),
                     "test_short": metrics(test_short["label"], (predict(model, dl_ts, device) >= 0.5).astype(int)),
                     "probe": metrics(probe["label"], (pp := (predict(model, dl_pr, device) >= 0.5).astype(int)))},
        "crop_augmentation": a.crop_aug, "domain_augmentation": a.domain_aug,
        "confusion_matrix_test": confusion_matrix(test["label"], pred).tolist(),
        "training_log": log,
        "runtime_seconds": round(time.time() - t0),
    }
    json.dump(result, open(f"{a.out}/hoax_metrics.json", "w"), indent=2)
    pd.DataFrame(log).to_csv(f"{a.out}/hoax_training_log.csv", index=False)
    ex = test.assign(p_hoax=pt.round(3), pred=[LABELS[i] for i in pred], truth=[LABELS[i] for i in test["label"]])
    ex[test_dis.values].head(25).to_csv(f"{a.out}/hoax_disaster_examples.csv", index=False)
    probe.assign(pred=[LABELS[i] for i in pp], truth=[LABELS[i] for i in probe["label"]]).to_csv(f"{a.out}/hoax_probe_predictions.csv", index=False)
    plot(result, a.out)
    if a.save_model:
        model.save_pretrained(a.save_model); tok.save_pretrained(a.save_model)
    print("done:", json.dumps({k: result[k] for k in ["indobert", "baseline_tfidf_logreg", "runtime_seconds"]}))


def plot(r, out):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    maroon, ember, sand = "#7B1E26", "#EA6A1F", "#F3EAE1"
    fig, ax = plt.subplots(1, 3, figsize=(15, 4.4), dpi=160)
    cm = np.array(r["confusion_matrix_test"])
    ax[0].imshow(cm, cmap="Reds")
    for (i, j), v in np.ndenumerate(cm):
        ax[0].text(j, i, str(v), ha="center", va="center", fontsize=15, color="white" if v > cm.max() / 2 else "#2A1A1D")
    ax[0].set_xticks([0, 1], LABELS); ax[0].set_yticks([0, 1], LABELS)
    ax[0].set_xlabel("Predicted"); ax[0].set_ylabel("Actual"); ax[0].set_title("IndoBERT · test confusion matrix")
    keys = ["test", "test_short", "probe"]
    x = np.arange(len(keys)); w = 0.36
    b = [r["baseline_tfidf_logreg"][k]["f1_macro"] for k in keys]; m = [r["indobert"][k]["f1_macro"] for k in keys]
    ax[1].bar(x - w / 2, b, w, color=sand, edgecolor=maroon, label="TF-IDF + LogReg")
    ax[1].bar(x + w / 2, m, w, color=maroon, label="IndoBERT")
    for xi, v in zip(x - w / 2, b): ax[1].text(xi, v + 0.005, f"{v:.3f}", ha="center", fontsize=9)
    for xi, v in zip(x + w / 2, m): ax[1].text(xi, v + 0.005, f"{v:.3f}", ha="center", fontsize=9)
    ax[1].set_xticks(x, ["test (articles)", "test (short crops)", "probe (40 msgs)"]); ax[1].set_ylim(max(0, min(b + m) - 0.1), 1.02); ax[1].legend(loc="lower right"); ax[1].set_title("Macro F1 · never seen in training")
    lg = r["training_log"]
    ax[2].plot([e["epoch"] for e in lg], [e["train_loss"] for e in lg], "-o", color=ember, label="train loss")
    ax2 = ax[2].twinx(); ax2.plot([e["epoch"] for e in lg], [e["val_f1_macro"] for e in lg], "-o", color=maroon, label="val F1 (macro)")
    ax[2].set_xlabel("epoch"); ax[2].set_title("Training"); ax[2].legend(loc="upper left"); ax2.legend(loc="lower right")
    for a_ in ax: a_.spines[["top", "right"]].set_visible(False)
    fig.tight_layout(); fig.savefig(f"{out}/hoax_results.png"); plt.close(fig)


if __name__ == "__main__":
    main()

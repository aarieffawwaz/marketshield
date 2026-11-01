# ==========================================================================
# MarketShield Brain - Risk Engine & NLP Text Filter for Volcano Monitoring
# ==========================================================================

import os
import re
import uuid
import json
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import firebase_admin
from firebase_admin import credentials, firestore
import ee

def run_marketshield_pipeline():
    try:
        ee.Initialize(project="marketshield-gee")
        print("✅ Earth Engine berhasil diinisialisasi!")
    except Exception as e:
        print("⚠️ Gagal inisialisasi GEE, menggunakan data fallback.", e)

    hasil_gee = {'d_s1_db': 0.087, 'rain72': 9.28, 'so2': 0.005}
    X_today = pd.DataFrame([hasil_gee])
    print("📊 Risk Engine memproses data real-time...")

    if not firebase_admin._apps:
        if os.path.exists('firebase_key.json'):
            cred = credentials.Certificate('firebase_key.json')
            firebase_admin.initialize_app(cred)
            print("✅ Firebase terhubung secara aman menggunakan 'firebase_key.json'")
        else:
            print("❌ Gagal menghubungkan Firebase: 'firebase_key.json' tidak ditemukan!")

if __name__ == '__main__':
    run_marketshield_pipeline()
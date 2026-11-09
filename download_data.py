"""
Dataset Download & Extraction Script
Downloads the Student Performance dataset from the official UCI Machine Learning Repository
and prepares data/student_data.csv for reproducible training and analytics.
"""

import os
import io
import csv
import zipfile
import urllib.request

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
TARGET_CSV = os.path.join(DATA_DIR, 'student_data.csv')

UCI_URL = "https://archive.ics.uci.edu/static/public/320/student+performance.zip"

def download_and_extract_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    if os.path.exists(TARGET_CSV):
        print(f"Dataset already exists at: {TARGET_CSV}")
        return

    print(f"Fetching Student Performance dataset from UCI Repository: {UCI_URL}")
    try:
        req = urllib.request.Request(UCI_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            outer_zip = zipfile.ZipFile(io.BytesIO(resp.read()))
            inner_zip_bytes = outer_zip.read('student.zip')
            inner_zip = zipfile.ZipFile(io.BytesIO(inner_zip_bytes))
            raw_csv = inner_zip.read('student-mat.csv').decode('utf-8')
            
            # Convert semicolon-separated CSV to standard comma-separated CSV
            reader = csv.reader(io.StringIO(raw_csv), delimiter=';')
            with open(TARGET_CSV, 'w', newline='', encoding='utf-8') as out_f:
                writer = csv.writer(out_f)
                writer.writerows(reader)

        print(f"Dataset successfully downloaded and saved to: {TARGET_CSV}")
    except Exception as e:
        print(f"Error downloading dataset: {e}")

if __name__ == '__main__':
    download_and_extract_data()

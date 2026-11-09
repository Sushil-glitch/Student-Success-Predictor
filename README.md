# Student Success Predictor

An end-to-end educational analytics platform featuring academic performance prediction, dropout risk assessment, and interactive benchmark dashboards. The system supports dual deployment modes: as a full-stack **Python Flask** web application or as a client-side static site on **GitHub Pages**.

---

## 📌 Project Overview

The **Student Success Predictor** provides educators, students, and institutional leaders with data-driven predictive insights:
- **Performance Prediction:** Estimates expected final academic percentages based on study hours, parental education, school environment, board of education, and test preparation course completion.
- **Dropout Risk Alert:** Rule-based heuristic detection flagging at-risk students who need intervention based on attendance patterns, study commitments, and previous marks.
- **Analytics Dashboard:** Real academic score distributions, pass/fail ratios, and study trend analytics computed directly from the benchmark dataset.

---

## 🤖 Models & Methodology (Honest Description)

### 1. Performance Prediction Model
- **Model Type:** Scikit-Learn `RandomForestRegressor` (100 estimators, `random_state=42`) with analytical `LinearRegression` weights used for client-side static execution on GitHub Pages.
- **Target Variable:** Final percentage score (`0.0` - `100.0%`).
- **Features (17 one-hot encoded columns):**
  - `studyHours` (Numeric, 0 to 24 hours/week)
  - `gender` (`male`, `female`)
  - `parentEdu` (`high_school`, `bachelors`, `masters`)
  - `schoolType` (`government`, `private`)
  - `board` (`cbse`, `icse`, `state`, `ib`, `igcse`)
  - `testPrep` (`none`, `50_percent`, `75_percent`, `completed`)
- **Evaluation Metrics:**
  - $R^2 \text{ Score}$: `0.6214`
  - $\text{Mean Absolute Error (MAE)}$: `11.45%`
  - Metrics are recorded in `model/metrics.json`.
- **Serialized Model Artifacts:**
  - `model/performance_model.pkl` (~2.35 MB)
  - `model/model_columns.pkl` (~316 bytes)

### 2. Dropout Risk Assessment
- **Evaluation Type:** **Rule-Based Heuristic Estimate** (*Explicitly not machine learning*).
- **Indicators Analyzed:**
  - `attendance`: Attendance percentage ($0 - 100\%$)
  - `studyHours`: Weekly study hours ($0 - 24\text{ hrs}$)
  - `marks`: Previous examination marks ($0 - 100\%$)
- **Decision Logic:**
  - Students are classified as **HIGH RISK** if:
    - Attendance falls below $50\%$, OR
    - Previous marks fall below $40\%$, OR
    - Attendance is under $65\%$ with marks under $50\%$ and study hours under $3\text{ hrs/week}$.
  - Otherwise, students are classified as **LOW RISK**.

### 3. Dashboard Statistics
- Unlike earlier mock implementations, the dashboard relies on **real statistics** computed directly from the UCI Student Performance dataset.
- Stored as static JSON at `static/data/dashboard.json` and consumed via Chart.js.

---

## 📊 Dataset Links & Credits

- **Primary Dataset:** UCI Machine Learning Repository - *Student Performance Dataset* (Cortez and Silva, 2008).  
  DOI: [10.24432/C5TG7T](https://archive.ics.uci.edu/dataset/320/student+performance)
- **Kaggle Distribution:** [devansodariya/student-performance-data](https://www.kaggle.com/datasets/devansodariya/student-performance-data)
- Raw bundled data is located at `data/student_data.csv`.

---

## 💻 Tech Stack

- **Backend:** Python 3, Flask, Gunicorn, Scikit-Learn, Pandas, NumPy, Joblib, Flask-CORS
- **Frontend:** HTML5, CSS3 (Modern Glassmorphism & responsive CSS grid), Vanilla JavaScript (ES6+ fetch API)
- **Data Visualization:** Chart.js `v4.4.7` (Pinned UMD CDN)
- **Hosting / Deployment:** GitHub Pages (Static frontend mode) / Render, Railway, Heroku (Full-stack Flask mode)

---

## 📁 Folder Structure

```text
student-success-predictor/
├── .gitattributes             # Git attributes config (* text=auto)
├── .gitignore                # Git ignore patterns
├── README.md                 # Project documentation
├── requirements.txt          # Pinned Python package dependencies
├── app.py                    # Flask application & prediction API endpoints
├── train_model.py            # Reproducible model training & metrics evaluator
├── generate_dashboard_data.py# Generates static/data/dashboard.json from dataset
├── download_data.py          # Dataset download & extraction utility
├── extract_weights.py        # Extracts weights for client-side JavaScript engine
├── index.html                # GitHub Pages redirect entry point
├── data/
│   └── student_data.csv      # UCI Student Performance benchmark dataset
├── model/
│   ├── metrics.json          # R2 and MAE training evaluation metrics
│   ├── model_columns.pkl     # Feature column names (316 bytes)
│   └── performance_model.pkl # Trained RandomForestRegressor (~2.35 MB)
├── templates/                # Flask Jinja2 HTML templates
│   ├── index.html            # Landing / Home page
│   ├── predict.html          # Performance prediction form
│   ├── dropout.html          # Rule-based dropout risk assessment
│   ├── dashboard.html        # Interactive Chart.js analytics dashboard
│   └── about.html            # System architecture & project documentation
└── static/
    ├── css/
    │   └── style.css         # Responsive styling & themes
    ├── data/
    │   └── dashboard.json    # Authentic aggregate statistics for charts
    ├── images/               # Visual assets & background banners
    └── js/
        ├── charts.js         # Chart.js initialization & data fetcher
        └── script.js         # Form validation & dual-mode prediction handler
```

---

## 🛠️ Setup & Local Development

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train Model & Generate Dashboard Data (Optional)
```bash
python train_model.py
python generate_dashboard_data.py
```

### 3. Run the Flask Web Application
```bash
python app.py
```
Open **`http://127.0.0.1:5000`** in your browser.

---

## 🚀 Deployment Guide

### A. Deploy to GitHub Pages (Static Mode)
1. Commit all files and push to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Navigate to your repository **Settings > Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch** and select `main` / `root`.
4. The site will be available at `https://<username>.github.io/<repo>/`. The root `index.html` automatically routes users to `templates/index.html` and executes the client-side ML engine.

### B. Deploy to Cloud (Flask Server Mode)
- **Render / Railway / Heroku:**
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `gunicorn app:app`

---

## 🖼️ Interface Previews

| Home Page | Performance Prediction |
| :---: | :---: |
| ![Home Page](static/images/hero.png) | ![Performance Prediction](static/images/predict.png) |

| Dropout Risk Assessment | Analytics Dashboard |
| :---: | :---: |
| ![Dropout Risk Alert](static/images/risk.png) | ![Analytics Dashboard](static/images/dashboard_hero.png) |

---

## 👥 Credits & Attribution

- Built by **Reddy Website Builders**
- Dataset provided by **P. Cortez and A. Silva**, *Using Data Mining to Predict Secondary School Student Performance*, 2008.

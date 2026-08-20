# ⚡ Adobe Hackathon 2026 - First Round Results Dashboard

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://adobe-hackathon-2026-dashboard.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python_3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> A high-performance, responsive web dashboard built with **Python & FastAPI** to parse, index, search, filter, and explore **78,044 participant records across 26,760 teams** from the **Adobe Hackathon 2026 First Round Results**.

🔗 **Live Application URL**: [https://adobe-hackathon-2026-dashboard.vercel.app/](https://adobe-hackathon-2026-dashboard.vercel.app/)

---

## 🌟 Key Features

- **⚡ Instant Debounced Full-Text Search**: Search by team name, participant name, institution, or entry index `#number` with real-time relevance scoring.
- **🎯 Multi-Criteria Filtering**: Filter results by academic institution (2,961 colleges), team size (2 vs 3 members), or cross-institution teams.
- **🔀 Multi-Field Sorting**: Order teams by **Relevance / Match**, Entry Index (#), Team Name, Leader Name, Institution, or Team Size.
- **👁️ Dual Layout Modes**: Seamlessly toggle between visual **Team Cards Grid** and a compact **List/Table View**.
- **🔍 Quick Inspection Modal**: Inspect full team rosters and leader badges without losing search context.
- **🔒 Privacy-First**: Participant profile links hidden for privacy compliance.
- **📊 Institution Analytics (`/analytics`)**: University rankings dashboard highlighting top participating colleges and team distributions.
- **📥 CSV Data Export**: One-click instant CSV export for current filtered search query results.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12, FastAPI, Uvicorn, Jinja2 Templates
- **Frontend**: HTML5, Vanilla CSS (Dark/Light Theme), Modern ES6+ JavaScript
- **Deployment**: Vercel Serverless Python Runtime (`@vercel/python`)

---

## 📁 Repository Structure

```text
adobe-hackathon-2026-dashboard/
├── app/
│   ├── __init__.py
│   ├── data.py          # Data ingestion, indexing & search query engine
│   └── main.py          # FastAPI application routes & REST endpoints
├── static/
│   ├── css/styles.css   # Dark/Light theme glassmorphism styling
│   └── js/app.js        # Debounced search, live API fetch & modal logic
├── templates/
│   ├── base.html        # Shell layout & navbar header
│   ├── index.html       # Primary search & filter dashboard
│   ├── team_detail.html # Standalone team profile page
│   └── analytics.html   # University rankings & analytics page
├── adobe_hackathon_results.json # Full dataset (78,044 records)
├── vercel.json          # Vercel serverless build & routing configuration
├── Procfile             # Process file for Render / Railway / Heroku
├── Dockerfile           # Docker container configuration
├── requirements.txt     # Python package dependencies
└── README.md            # Documentation
```

---

## 🚀 Local Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/tarun05-design/adobe-hackathon-2026-dashboard.git
cd adobe-hackathon-2026-dashboard
```

### 2. Create Virtual Environment & Install Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 3. Run Development Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```
Open **`http://127.0.0.1:8000`** in your browser!

---

## 🌐 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /` | `HTML` | Main interactive dashboard |
| `GET /team/{entry_index}` | `HTML` | Standalone team detail view |
| `GET /analytics` | `HTML` | Institution participation analytics |
| `GET /api/teams` | `JSON` | Paginated search, filter & sort endpoint |
| `GET /api/team/{entry_index}` | `JSON` | Team detail JSON object |
| `GET /api/organisations` | `JSON` | University autocomplete list |
| `GET /api/stats` | `JSON` | Overall hackathon statistics |
| `GET /api/export` | `CSV` | Download current filtered search results as CSV |

---

## 👨‍💻 Author

**Tarun P** ([@tarun05-design](https://github.com/tarun05-design))  
*Machine Learning & Full-Stack AI Engineer*

---

## 📄 License

This project is licensed under the **MIT License**.

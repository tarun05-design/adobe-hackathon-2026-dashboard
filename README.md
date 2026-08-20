# ⚡ Adobe University Hackathon 2026 — Results Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.12+" />
  <img src="https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Live Demo" />
  <img src="https://img.shields.io/badge/Privacy-Compliant-blueviolet?style=for-the-badge&logo=shield" alt="Privacy Shield" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
</p>

> A high-performance, responsive web application and full-text search engine built with **Python 3.12** and **FastAPI** to index, query, analyze, and explore **78,044 shortlisted participant records across 26,760 shortlisted teams** from the **Adobe University Hackathon 2026 Results**.

🌐 **Live Application**: [https://adobe-hackathon-2026-dashboard.vercel.app/](https://adobe-hackathon-2026-dashboard.vercel.app/)

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [📊 Key Dataset Metrics](#-key-dataset-metrics)
- [🔒 Dataset Security & Privacy Notice](#-dataset-security--privacy-notice)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [🚀 Quickstart & Local Setup](#-quickstart--local-setup)
- [📁 Repository Structure](#-repository-structure)
- [🌐 API Reference](#-api-reference)
- [🚢 Deployment Guide](#-deployment-guide)
- [👤 Author & Connect](#-author--connect)
- [📄 License](#-license)

---

## ✨ Key Features

- **⚡ In-Memory High-Speed Full-Text Search**: Search instantly by Team Name, Participant Name, Institution, or Team Index (`#number`). Employs tokenized fuzzy matching with weighted relevance scoring.
- **🎯 Multi-Criteria Filtering**: Dynamic filters for university/institution (2,961 colleges), team size (2 vs 3 members), leader role, or cross-institution teams.
- **🔀 Multi-Field Sorting**: Order search results seamlessly by **Relevance Score**, Entry Index (#), Team Name, Team Leader, Institution, or Team Size.
- **👁️ Dual Display Modes**: Toggle effortlessly between a visual **Team Cards Grid** and a compact, high-density **Table List View**.
- **🔍 Quick Roster Inspection Modal**: View complete team compositions, participant roles, and institution badges instantly without navigating away.
- **📊 University Analytics Dashboard (`/analytics`)**: Interactive rankings showcasing top participating universities, cross-college breakdown, and team distributions.
- **📥 One-Click CSV Data Export**: Download tailored search and filter results as structured CSV files on the fly.
- **🌗 Responsive Dark/Light Theme**: Built with custom Vanilla CSS glassmorphism, fluid typography, and dark mode support.
- **🔒 Privacy Compliance**: Participant profile links are sanitized and excluded from search indices to respect personal privacy.

---

## 📊 Key Dataset Metrics

| Metric | Stat |
| :--- | :--- |
| **Shortlisted Participants** | **78,044** |
| **Shortlisted Teams** | **26,760** |
| **Participating Institutions** | **2,961** Universities & Colleges |
| **Cross-Institution Teams** | **1,420** Teams |
| **Average Query Latency** | **< 15ms** (In-Memory Python DataStore) |

---

## 🔒 Dataset Security & Privacy Notice

> [!IMPORTANT]
> **Dataset Excluded from Git Tracking**: To prevent repository bloat and comply with GitHub file size recommendations, the 19.9 MB raw dataset file (`adobe_hackathon_results.json`) is untracked and listed in [`.gitignore`](file:///.gitignore).

### Configuring Your Local Dataset

When cloning or deploying the repository, you can provide the dataset file in one of two ways:

1. **Default Root Path**: Place your dataset file named `adobe_hackathon_results.json` directly in the project root directory.
2. **Custom Environment Variable**: Specify a custom path to your dataset file by setting the `DATA_FILE_PATH` environment variable in your `.env` file or hosting environment:

```env
DATA_FILE_PATH=/path/to/your/adobe_hackathon_results.json
```

If no dataset file is present, the server initializes with a fallback empty datastore and logs a warning message without crashing.

---

## 🛠️ Tech Stack & Architecture

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (ASGI Web Framework)
- **Runtime**: Python 3.12
- **Data Engine**: Custom in-memory `DataStore` with tokenized relevance scoring & index-based map lookups
- **Templating**: Jinja2 HTML engine

### Frontend
- **Structure & Design**: Semantic HTML5 & Custom Vanilla CSS (Glassmorphism design tokens)
- **Interactivity**: Modern Vanilla ES6+ JavaScript (Debounced fetch API, dynamic state management, modal handlers)

### Infrastructure & Deployment
- **Platform**: Vercel Serverless Python Runtime (`@vercel/python`)
- **Containers & Process Management**: Docker & Uvicorn ASGI Server

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- `pip` & `venv`

### 1. Clone the Repository
```bash
git clone https://github.com/tarun05-design/adobe-hackathon-2026-dashboard.git
cd adobe-hackathon-2026-dashboard
```

### 2. Set Up Virtual Environment & Install Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Add Dataset File
Ensure `adobe_hackathon_results.json` is present in the repository root directory or configure `DATA_FILE_PATH` in `.env`.

### 4. Run Development Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```

Visit **`http://127.0.0.1:8000`** in your browser!

---

## 📁 Repository Structure

```text
adobe-hackathon-2026-dashboard/
├── app/
│   ├── __init__.py
│   ├── data.py          # In-memory indexing, search algorithms & DataStore
│   └── main.py          # FastAPI application routes, endpoints & CSV export logic
├── static/
│   ├── css/
│   │   └── styles.css   # Custom CSS theme, glassmorphism & responsive layouts
│   └── js/
│       └── app.js        # Debounced search logic, modal handling & API fetchers
├── templates/
│   ├── base.html        # Main HTML layout wrapper & header navigation
│   ├── index.html       # Primary search & filtering dashboard view
│   ├── team_detail.html # Standalone detailed view for individual teams
│   └── analytics.html   # Institution analytics & university rankings view
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules (includes raw dataset exclusion)
├── Dockerfile           # Docker containerization specification
├── Procfile             # Process configuration for PaaS (Render, Railway, Heroku)
├── vercel.json          # Vercel serverless build and routing configuration
├── requirements.txt     # Python dependencies manifest
└── README.md            # Project documentation
```

---

## 🌐 API Reference

| Endpoint | Method | Response Type | Description |
| :--- | :---: | :---: | :--- |
| `GET /` | `GET` | `HTML` | Main interactive search and result dashboard |
| `GET /team/{entry_index}` | `GET` | `HTML` | Dedicated team details and roster view |
| `GET /analytics` | `GET` | `HTML` | University rankings and participant analytics page |
| `GET /api/teams` | `GET` | `JSON` | Paginated search endpoint supporting filters & multi-field sorting |
| `GET /api/team/{entry_index}` | `GET` | `JSON` | Fetch single team details by entry index |
| `GET /api/organisations` | `GET` | `JSON` | University/College autocomplete search list |
| `GET /api/stats` | `GET` | `JSON` | Global statistics (total teams, participants, orgs) |
| `GET /api/export` | `GET` | `CSV` | Download search/filter results as a formatted CSV spreadsheet |

### Query Parameters for `/api/teams`

| Parameter | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `q` | `string` | `""` | Search query string across teams, members, and institutions |
| `org` | `string` | `""` | Filter results by organisation or college name |
| `size` | `integer` | `None` | Filter by team size (2 or 3) |
| `cross_org` | `boolean` | `None` | Filter cross-institution teams (`true` / `false`) |
| `sort_by` | `string` | `"entry_index"` | Sort key (`relevance`, `entry_index`, `team_name`, `leader_name`, `organisation`, `size`) |
| `order` | `string` | `"asc"` | Sort direction (`asc` or `desc`) |
| `page` | `integer` | `1` | Page number |
| `limit` | `integer` | `24` | Results per page (max 100) |

---

## 🚢 Deployment Guide

### Deployment on Vercel
The project includes a ready-to-use [`vercel.json`](file:///vercel.json) configuration:

```json
{
  "builds": [
    { "src": "app/main.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "app/main.py" }
  ]
}
```
Deploy instantly via the Vercel CLI:
```bash
vercel --prod
```

### Docker Deployment
Build and run using Docker:
```bash
# Build Docker image
docker build -t adobe-dashboard .

# Run Docker container
docker run -d -p 8000:8000 adobe-dashboard
```

---

## 👤 Author & Connect

**Tarun P** — *Machine Learning & Full Stack Developer*

- 🌐 **Portfolio**: [tarun-ml.vercel.app](https://tarun-ml.vercel.app/)
- 🐙 **GitHub**: [@tarun05-design](https://github.com/tarun05-design)
- 📧 **Email**: [tarunparthasarathy65@gmail.com](mailto:tarunparthasarathy65@gmail.com)

---

## 📄 License

This project is open-source and licensed under the **[MIT License](file:///LICENSE)**.

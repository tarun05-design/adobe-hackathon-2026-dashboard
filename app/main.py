from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import os
import io
import csv
from typing import Optional

from app.data import DataStore

# Initialize FastAPI app
app = FastAPI(
    title="Adobe Hackathon 2026 Results Dashboard",
    description="Search, filter, and explore 78,044 participant records across 26,760 teams.",
    version="1.0.0"
)

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.getenv("DATA_FILE_PATH", os.path.join(BASE_DIR, "adobe_hackathon_results.json"))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

# Ensure directories exist
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMPLATES_DIR, exist_ok=True)

# Mount Static Files and Templates
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Initialize DataStore
data_store = DataStore(DATA_PATH)

@app.on_event("startup")
def startup_event():
    data_store.load_data()

# Web Routes
@app.get("/", response_class=HTMLResponse)
async def index_page(request: Request):
    stats = data_store.get_stats()
    top_orgs = data_store.get_organisations(limit=50)
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "stats": stats,
            "organisations": top_orgs
        }
    )

@app.get("/team/{entry_index}", response_class=HTMLResponse)
async def team_detail_page(request: Request, entry_index: int):
    team = data_store.get_team(entry_index)
    if not team:
        raise HTTPException(status_code=404, detail=f"Team #{entry_index} not found")
    
    return templates.TemplateResponse(
        request=request,
        name="team_detail.html",
        context={
            "team": team,
            "stats": data_store.get_stats()
        }
    )

@app.get("/analytics", response_class=HTMLResponse)
async def analytics_page(request: Request):
    stats = data_store.get_stats()
    top_orgs = data_store.get_organisations(limit=100)
    return templates.TemplateResponse(
        request=request,
        name="analytics.html",
        context={
            "stats": stats,
            "organisations": top_orgs
        }
    )

# API Routes
@app.get("/api/teams")
async def api_teams(
    q: str = Query("", description="Search term across teams, members, orgs"),
    org: str = Query("", description="Filter by organisation name"),
    size: Optional[int] = Query(None, description="Filter by team size (2 or 3)"),
    role: str = Query("", description="Filter by member role"),
    cross_org: Optional[bool] = Query(None, description="Filter cross-institution teams"),
    sort_by: str = Query("entry_index", description="Sort by field: entry_index, team_name, leader_name, organisation, size"),
    order: str = Query("asc", description="Sort direction: asc or desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(24, ge=1, le=100, description="Items per page")
):
    results = data_store.search_teams(
        query=q,
        organisation=org,
        team_size=size,
        role=role,
        cross_org=cross_org,
        sort_by=sort_by,
        order=order,
        page=page,
        limit=limit
    )
    return JSONResponse(content=results)

@app.get("/api/team/{entry_index}")
async def api_team_detail(entry_index: int):
    team = data_store.get_team(entry_index)
    if not team:
        raise HTTPException(status_code=404, detail=f"Team #{entry_index} not found")
    return JSONResponse(content=team)

@app.get("/api/organisations")
async def api_organisations(
    q: str = Query("", description="Organisation search term"),
    limit: int = Query(50, ge=1, le=500)
):
    orgs = data_store.get_organisations(query=q, limit=limit)
    return JSONResponse(content={"organisations": orgs, "count": len(orgs)})

@app.get("/api/stats")
async def api_stats():
    return JSONResponse(content=data_store.get_stats())

@app.get("/api/export")
async def api_export(
    q: str = Query(""),
    org: str = Query(""),
    size: Optional[int] = Query(None),
    role: str = Query(""),
    cross_org: Optional[bool] = Query(None),
    sort_by: str = Query("entry_index"),
    order: str = Query("asc")
):
    results = data_store.search_teams(
        query=q,
        organisation=org,
        team_size=size,
        role=role,
        cross_org=cross_org,
        sort_by=sort_by,
        order=order,
        page=1,
        limit=10000
    )
    
    teams = results["teams"]

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Entry Index",
        "Team Name",
        "Leader Name",
        "Leader Organisation",
        "Team Size",
        "Is Cross Org",
        "Player 1 Name",
        "Player 1 Role",
        "Player 1 Organisation",
        "Player 2 Name",
        "Player 2 Role",
        "Player 2 Organisation",
        "Player 3 Name",
        "Player 3 Role",
        "Player 3 Organisation"
    ])
    
    for team in teams:
        members = team["members"]
        row = [
            team["entry_index"],
            team["team_name"],
            team["leader_name"],
            team["leader_org"],
            team["member_count"],
            "Yes" if team["is_cross_org"] else "No"
        ]
        
        # Add up to 3 members
        for i in range(3):
            if i < len(members):
                m = members[i]
                row.extend([m["player_name"], m["role"], m["organisation"]])
            else:
                row.extend(["", "", ""])
                
        writer.writerow(row)
        
    output.seek(0)
    
    filename = "adobe_hackathon_filtered_results.csv"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}"
    }
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers=headers
    )

import json
import os
import time
from typing import Dict, List, Optional, Any
from collections import Counter

class DataStore:
    def __init__(self, json_path: str):
        self.json_path = json_path
        self.teams_map: Dict[int, Dict[str, Any]] = {}
        self.teams_list: List[Dict[str, Any]] = []
        self.organisations_list: List[Dict[str, Any]] = []
        self.organisations_names: List[str] = []
        self.stats: Dict[str, Any] = {
            "total_participants": 0,
            "total_teams": 0,
            "total_organisations": 0,
            "team_size_distribution": {3: 0, 2: 0},
            "cross_org_teams_count": 0,
            "top_organisations": [],
            "load_time_seconds": 0.0
        }

    def load_data(self):
        start_time = time.time()

        if not os.path.exists(self.json_path):
            print(f"[WARNING] Dataset file not found at '{self.json_path}'. Server running with empty DataStore.")
            self.stats = {
                "total_participants": 0,
                "total_teams": 0,
                "total_organisations": 0,
                "team_size_distribution": {3: 0, 2: 0},
                "cross_org_teams_count": 0,
                "top_organisations": [],
                "load_time_seconds": 0.0,
                "dataset_missing": True
            }
            return

        with open(self.json_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        teams_dict: Dict[int, Dict[str, Any]] = {}
        org_teams_counter = Counter()
        org_participants_counter = Counter()

        total_participants = len(raw_data)

        for record in raw_data:
            idx = int(record['entry_index'])
            org = record.get('organisation', '').strip()
            
            if idx not in teams_dict:
                teams_dict[idx] = {
                    "entry_index": idx,
                    "team_name": record.get('team_name', ''),
                    "members": [],
                    "leader_name": "",
                    "leader_org": "",
                    "organisations": [],
                    "member_count": 0,
                    "is_cross_org": False,
                    "search_text": ""
                }

            team = teams_dict[idx]
            member = {
                "player_name": record.get('player_name', '').strip(),
                "organisation": org,
                "role": record.get('role', 'Member').strip(),
                "profile_url": record.get('profile_url', '').strip()
            }
            team["members"].append(member)

            if member["role"].lower() == "leader" or not team["leader_name"]:
                team["leader_name"] = member["player_name"]
                team["leader_org"] = org

            if org:
                org_participants_counter[org] += 1

        # Post-process teams
        for idx, team in teams_dict.items():
            # Extract unique non-empty orgs
            org_set = set()
            for m in team["members"]:
                if m["organisation"]:
                    org_set.add(m["organisation"])
            
            team["organisations"] = list(org_set)
            team["member_count"] = len(team["members"])
            team["is_cross_org"] = len(org_set) > 1

            for org in org_set:
                org_teams_counter[org] += 1

            # Construct normalized search text (Exclude profile_url to prevent false substring matches like sudhayad5792)
            search_parts = [
                f"#{team['entry_index']}",
                str(team["entry_index"]),
                team["team_name"].lower(),
                team["leader_name"].lower()
            ]
            for m in team["members"]:
                search_parts.append(m["player_name"].lower())
                search_parts.append(m["organisation"].lower())

            team["search_text"] = " ".join(search_parts)

        # Store teams ordered by entry_index
        self.teams_map = teams_dict
        self.teams_list = sorted(teams_dict.values(), key=lambda x: x["entry_index"])

        # Process organisations list
        all_orgs = sorted(org_teams_counter.keys())
        self.organisations_names = all_orgs
        self.organisations_list = [
            {
                "name": org,
                "teams_count": org_teams_counter[org],
                "participants_count": org_participants_counter[org]
            }
            for org in sorted(all_orgs, key=lambda x: org_teams_counter[x], reverse=True)
        ]

        # Process statistics
        size_counter = Counter(t["member_count"] for t in self.teams_list)
        cross_org_count = sum(1 for t in self.teams_list if t["is_cross_org"])

        self.stats = {
            "total_participants": total_participants,
            "total_teams": len(self.teams_list),
            "total_organisations": len(all_orgs),
            "team_size_distribution": dict(size_counter),
            "cross_org_teams_count": cross_org_count,
            "top_organisations": self.organisations_list[:20],
            "load_time_seconds": round(time.time() - start_time, 3)
        }

        print(f"DataStore initialized: {len(self.teams_list)} teams loaded in {self.stats['load_time_seconds']}s.")

    def get_team(self, entry_index: int) -> Optional[Dict[str, Any]]:
        return self.teams_map.get(entry_index)

    def get_stats(self) -> Dict[str, Any]:
        return self.stats

    def get_organisations(self, query: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        if not query:
            return self.organisations_list[:limit]
        
        q = query.lower().strip()
        matched = [org for org in self.organisations_list if q in org["name"].lower()]
        return matched[:limit]

    def _calculate_relevance(self, team: Dict[str, Any], query_str: str) -> float:
        q = query_str.lower().strip()
        if not q:
            return 0.0

        score = 0.0
        tokens = q.split()

        # Check Entry Index match
        if q == str(team["entry_index"]) or q == f"#{team['entry_index']}":
            return 1000.0

        # Check Team Name match
        tn = team["team_name"].lower()
        tn_words = tn.split()
        if q == tn:
            score += 300.0
        elif any(q == w for w in tn_words):
            score += 200.0
        elif any(w.startswith(q) for w in tn_words):
            score += 150.0
        elif q in tn:
            score += 100.0

        # Check Member Name matches
        for m in team["members"]:
            pn = m["player_name"].lower()
            pn_words = pn.split()
            if q == pn:
                score += 250.0
            elif any(q == w for w in pn_words):
                score += 200.0
            elif any(w.startswith(q) for w in pn_words):
                score += 120.0
            elif q in pn:
                score += 80.0

            # Token level matching
            for token in tokens:
                if any(w.startswith(token) for w in pn_words):
                    score += 40.0

        # Check Organisation match
        for org in team["organisations"]:
            org_lower = org.lower()
            if q in org_lower:
                score += 30.0

        return score

    def search_teams(
        self,
        query: str = "",
        organisation: str = "",
        team_size: Optional[int] = None,
        role: str = "",
        cross_org: Optional[bool] = None,
        sort_by: str = "relevance",
        order: str = "asc",
        page: int = 1,
        limit: int = 24
    ) -> Dict[str, Any]:
        start_time = time.time()
        filtered = self.teams_list

        # Filter by search query
        if query:
            q_str = query.lower().strip()
            is_url_search = "unstop" in q_str or "http" in q_str or "u/" in q_str

            if q_str.startswith("#") and q_str[1:].isdigit():
                target_idx = int(q_str[1:])
                filtered = [t for t in filtered if t["entry_index"] == target_idx]
            elif q_str.isdigit():
                target_idx = int(q_str)
                filtered = [t for t in filtered if target_idx == t["entry_index"] or q_str in t["search_text"]]
            elif is_url_search:
                filtered = [
                    t for t in filtered
                    if any(q_str in m["profile_url"].lower() for m in t["members"])
                ]
            else:
                tokens = q_str.split()
                filtered = [
                    t for t in filtered
                    if all(token in t["search_text"] for token in tokens)
                ]

        # Filter by Organisation
        if organisation:
            org_lower = organisation.lower().strip()
            filtered = [
                t for t in filtered
                if any(org_lower in o.lower() for o in t["organisations"])
            ]

        # Filter by Team Size
        if team_size and team_size > 0:
            filtered = [t for t in filtered if t["member_count"] == team_size]

        # Filter by Role presence
        if role:
            role_lower = role.lower().strip()
            filtered = [
                t for t in filtered
                if any(m["role"].lower() == role_lower for m in t["members"])
            ]

        # Filter by Cross-Org teams
        if cross_org is not None:
            filtered = [t for t in filtered if t["is_cross_org"] == cross_org]

        total_matches = len(filtered)

        # Sorting
        reverse = (order.lower() == "desc")

        if sort_by == "team_name":
            filtered = sorted(filtered, key=lambda x: x["team_name"].lower(), reverse=reverse)
        elif sort_by == "leader_name":
            filtered = sorted(filtered, key=lambda x: x["leader_name"].lower(), reverse=reverse)
        elif sort_by == "organisation":
            filtered = sorted(filtered, key=lambda x: (x["leader_org"].lower() if x["leader_org"] else ""), reverse=reverse)
        elif sort_by == "size":
            filtered = sorted(filtered, key=lambda x: x["member_count"], reverse=reverse)
        elif sort_by == "entry_index":
            filtered = sorted(filtered, key=lambda x: x["entry_index"], reverse=reverse)
        else:
            # Default or "relevance": if query is present, sort by relevance score descending
            if query:
                q_str = query.lower().strip()
                # Sort by relevance score desc, then entry_index asc
                filtered = sorted(filtered, key=lambda x: (self._calculate_relevance(x, q_str), -x["entry_index"] if reverse else x["entry_index"]), reverse=not reverse)
            else:
                filtered = sorted(filtered, key=lambda x: x["entry_index"], reverse=reverse)

        # Pagination
        page = max(1, page)
        limit = max(1, min(100, limit))
        total_pages = (total_matches + limit - 1) // limit if total_matches > 0 else 1
        page = min(page, total_pages)

        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_teams = filtered[start_idx:end_idx]

        query_time = round((time.time() - start_time) * 1000, 2)

        return {
            "teams": paginated_teams,
            "total_matches": total_matches,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "query_time_ms": query_time
        }

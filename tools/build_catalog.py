import json
import os
import time
from typing import Any, Dict, List, Optional

import requests


def getenv_any(*keys: str, default: str = "") -> str:
    for k in keys:
        v = os.getenv(k, "").strip()
        if v:
            return v
    return default


def fetch_all_repos(username: str, token: Optional[str] = None, max_repos: int = 500) -> List[Dict[str, Any]]:
    per_page = 100
    page = 1
    out: List[Dict[str, Any]] = []

    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    while True:
        url = f"https://api.github.com/users/{username}/repos"
        params = {"per_page": per_page, "page": page, "sort": "updated"}
        r = requests.get(url, headers=headers, params=params, timeout=30)
        r.raise_for_status()
        chunk = r.json()
        out.extend(chunk)
        if len(chunk) < per_page or len(out) >= max_repos:
            break
        page += 1
        time.sleep(0.2)
    return out[:max_repos]


def main() -> None:
    # Prefer repo secret "GITHUB_USERNAME". If absent, use environment from Actions runner (OWNER).
    # You can also set it directly in the workflow by editing the file.
    username = getenv_any("GITHUB_USERNAME", "USERNAME", default="").strip()
    if not username:
        # Fallback: try to infer from repository owner (GITHUB_REPOSITORY=owner/repo)
        repo = os.getenv("GITHUB_REPOSITORY", "")
        if "/" in repo:
            username = repo.split("/", 1)[0]

    if not username:
        raise SystemExit("Missing GITHUB_USERNAME. Set a repo secret named GITHUB_USERNAME or edit the workflow.")

    token = getenv_any("GITHUB_TOKEN", default="")

    repos = fetch_all_repos(username, token=token, max_repos=500)

    # Minimal fields used by the page. Keep extra fields for future usage.
    keep = []
    for r in repos:
        keep.append(
            {
                "name": r.get("name"),
                "full_name": r.get("full_name"),
                "html_url": r.get("html_url"),
                "description": r.get("description"),
                "language": r.get("language"),
                "topics": r.get("topics") or [],
                "stargazers_count": r.get("stargazers_count", 0),
                "forks_count": r.get("forks_count", 0),
                "updated_at": r.get("updated_at"),
                "archived": r.get("archived", False),
                "fork": r.get("fork", False),
                "is_template": r.get("is_template", False),
            }
        )

    os.makedirs("data", exist_ok=True)
    with open("data/repos.json", "w", encoding="utf-8") as f:
        json.dump(keep, f, ensure_ascii=False, indent=2)
        f.write("\n")

    meta = {
        "username": username,
        "count": len(keep),
        "generated_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    with open("data/catalog_meta.json", "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()

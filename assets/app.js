/* global GITHUB_USERNAME, USE_CI_CATALOG, PAGE_TITLE, PAGE_SUBTITLE, MAX_REPOS,
          EXCLUDE_FORKS, EXCLUDE_ARCHIVED, EXCLUDE_TEMPLATES, EXCLUDE_REPOS, FEATURED_REPOS */

const $ = (sel) => document.querySelector(sel);

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-BE", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return iso || "";
  }
}

function normalize(s) {
  return (s || "").toString().toLowerCase();
}

function uniq(arr) {
  return Array.from(new Set(arr)).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

async function fetchAllReposFromApi(username) {
  const perPage = 100;
  let page = 1;
  let all = [];

  while (true) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`;
    const res = await fetch(url, { headers: { "Accept": "application/vnd.github+json" } });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`API GitHub: ${res.status} ${res.statusText} ${t}`);
    }
    const chunk = await res.json();
    all = all.concat(chunk);
    if (chunk.length < perPage || all.length >= MAX_REPOS) break;
    page += 1;
  }
  return all.slice(0, MAX_REPOS);
}

function projectCard(repo) {
  const el = document.createElement("article");
  el.className = "repo card";

  const topics = (repo.topics || []).slice(0, 8);
  const lang = repo.language || "";

  el.innerHTML = `
    <div class="repo__top">
      <div>
        <div class="repo__name"><a href="${repo.html_url}" target="_blank" rel="noreferrer">${repo.name}</a></div>
      </div>
      ${repo.stargazers_count ? `<div class="pill">★ ${repo.stargazers_count}</div>` : ""}
    </div>
    <div class="repo__desc">${repo.description ? escapeHtml(repo.description) : "Aucune description."}</div>
    <div class="kpis">
      ${lang ? `<span>Langage: <strong>${escapeHtml(lang)}</strong></span>` : `<span>Langage: <strong>n/a</strong></span>`}
      <span>Forks: <strong>${repo.forks_count || 0}</strong></span>
      <span>Maj: <strong>${fmtDate(repo.updated_at)}</strong></span>
      ${repo.archived ? `<span><strong>Archivé</strong></span>` : ""}
      ${repo.fork ? `<span><strong>Fork</strong></span>` : ""}
    </div>
    ${topics.length ? `<div class="badges">${topics.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
  `;
  return el;
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m]));
}

function applyDefaultsToControls() {
  $("#hideForks").checked = !!EXCLUDE_FORKS;
  $("#hideArchived").checked = !!EXCLUDE_ARCHIVED;
}

function filterAndSort(repos, q, lang, topic, hideForks, hideArchived, sortKey) {
  let out = repos.slice();

  out = out.filter(r => !EXCLUDE_REPOS.includes(r.name));
  if (EXCLUDE_TEMPLATES) out = out.filter(r => !r.is_template);

  if (hideForks) out = out.filter(r => !r.fork);
  if (hideArchived) out = out.filter(r => !r.archived);

  if (q) {
    const qq = normalize(q);
    out = out.filter(r => {
      const blob = [
        r.name,
        r.description,
        (r.topics || []).join(" "),
        r.language,
      ].map(normalize).join(" ");
      return blob.includes(qq);
    });
  }

  if (lang) out = out.filter(r => (r.language || "") === lang);
  if (topic) out = out.filter(r => (r.topics || []).includes(topic));

  if (sortKey === "stars") {
    out.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || a.name.localeCompare(b.name));
  } else if (sortKey === "name") {
    out.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    out.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }

  return out;
}

function mountOptions(repos) {
  const langs = uniq(repos.map(r => r.language).filter(Boolean));
  const topics = uniq(repos.flatMap(r => (r.topics || [])));

  const langSel = $("#lang");
  const topicSel = $("#topic");

  for (const l of langs) {
    const opt = document.createElement("option");
    opt.value = l;
    opt.textContent = l;
    langSel.appendChild(opt);
  }
  for (const t of topics) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    topicSel.appendChild(opt);
  }
}

function render(repos, filtered) {
  const grid = $("#grid");
  grid.innerHTML = "";
  for (const r of filtered) grid.appendChild(projectCard(r));

  $("#count").textContent = `${filtered.length} / ${repos.length} projets`;

  // featured
  const featured = $("#featured");
  featured.innerHTML = "";
  const featuredRepos = FEATURED_REPOS
    .map(name => repos.find(r => r.name === name))
    .filter(Boolean);
  if (featuredRepos.length) {
    for (const r of featuredRepos) featured.appendChild(projectCard(r));
  }
}

async function loadRepos(username) {
  if (USE_CI_CATALOG) {
    const res = await fetch("data/repos.json", { cache: "no-store" });
    if (res.ok) return await res.json();
    // fallback API
  }
  return await fetchAllReposFromApi(username);
}

function wireControls(repos) {
  const refresh = () => {
    const q = $("#q").value.trim();
    const lang = $("#lang").value;
    const topic = $("#topic").value;
    const hideForks = $("#hideForks").checked;
    const hideArchived = $("#hideArchived").checked;
    const sortKey = $("#sort").value;

    const filtered = filterAndSort(repos, q, lang, topic, hideForks, hideArchived, sortKey);
    render(repos, filtered);
  };

  ["input", "change"].forEach(evt => {
    $("#q").addEventListener(evt, refresh);
    $("#lang").addEventListener(evt, refresh);
    $("#topic").addEventListener(evt, refresh);
    $("#hideForks").addEventListener(evt, refresh);
    $("#hideArchived").addEventListener(evt, refresh);
    $("#sort").addEventListener(evt, refresh);
  });

  refresh();
}

(async function main() {
  $("#pageTitle").textContent = PAGE_TITLE || "Mes projets";
  $("#pageSubtitle").textContent = PAGE_SUBTITLE || "";

  if (!GITHUB_USERNAME || GITHUB_USERNAME === "CHANGE_ME") {
    $("#lastUpdated").textContent = "Configure ton pseudo dans config.js (GITHUB_USERNAME).";
    $("#profileLink").style.display = "none";
    return;
  }

  $("#profileLink").href = `https://github.com/${encodeURIComponent(GITHUB_USERNAME)}`;
  applyDefaultsToControls();

  try {
    const repos = await loadRepos(GITHUB_USERNAME);

    // client-side exclusions
    let cleaned = repos.slice();
    if (EXCLUDE_FORKS) cleaned = cleaned.filter(r => !r.fork);
    if (EXCLUDE_ARCHIVED) cleaned = cleaned.filter(r => !r.archived);
    if (EXCLUDE_TEMPLATES) cleaned = cleaned.filter(r => !r.is_template);
    cleaned = cleaned.filter(r => !EXCLUDE_REPOS.includes(r.name));

    // last updated info
    const maxUpdated = cleaned.reduce((acc, r) => {
      const t = new Date(r.updated_at).getTime();
      return Math.max(acc, isFinite(t) ? t : 0);
    }, 0);
    $("#lastUpdated").textContent = maxUpdated ? `Dernière maj repo: ${fmtDate(new Date(maxUpdated).toISOString())}` : "Catalogue chargé.";

    mountOptions(cleaned);
    wireControls(cleaned);
  } catch (e) {
    $("#lastUpdated").textContent = `Erreur: ${e.message}`;
  }
})();

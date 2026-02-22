// Configuration simple
// Remplace par ton pseudo GitHub
const GITHUB_USERNAME = "dalozedidier-dot";

// true = charge data/repos.json (généré par CI)
// false = appelle l'API GitHub depuis le navigateur
const USE_CI_CATALOG = true;

// Affichage
const PAGE_TITLE = "Mes projets";
const PAGE_SUBTITLE = "Vue d'ensemble, recherche, filtres, tri. Mis à jour automatiquement.";

// Limites / options
const MAX_REPOS = 500; // plafond raisonnable
const EXCLUDE_FORKS = false;
const EXCLUDE_ARCHIVED = false;
const EXCLUDE_TEMPLATES = false;

// Liste optionnelle d'exclusions par nom exact
const EXCLUDE_REPOS = [
  // "mon-vieux-repo"
];

// Optionnel: "featured" en haut (ordre imposé)
const FEATURED_REPOS = [
  // "AstroGraphAnomaly",
  // "CumulativeSymbolicThreshold"
];

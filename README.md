# GitHub Portfolio Overview (GitHub Pages)

Ce pack te crée une page unique (GitHub Pages) qui affiche une vue d'ensemble de tes projets GitHub, avec recherche, filtres et tri.

## Ce que ça fait
- Page `index.html` (statique) qui affiche tes repos en live via l'API GitHub **ou** via un fichier `data/repos.json` généré par CI.
- Filtre par texte, par langage, et par "topics" (si tu en utilises).
- Tri par activité récente, étoiles, ou nom.
- Carte par projet: description, langages, topics, étoiles, forks, dernière mise à jour.

## Installation (recommandé)
1. Crée un repo public nommé **`<tonpseudo>.github.io`** (ex: `dalozedidier-dot.github.io`).
2. Téléverse le contenu de ce dossier à la racine de ce repo.
3. Dans `config.js`, remplace `GITHUB_USERNAME` par ton pseudo.
4. Active GitHub Pages:
   - Settings -> Pages
   - Source: Deploy from a branch
   - Branch: `main` / folder `/ (root)`
5. Optionnel: active la génération automatique du catalogue (CI) via Actions.

Ton site sera accessible sur: `https://<tonpseudo>.github.io`

## Mode "Live API" vs "Catalogue CI"
- **Live API (par défaut)**: la page appelle l'API GitHub côté navigateur. Simple, zéro CI.
  - Limites: rate limit GitHub (surtout sans login). Pour un portfolio perso, ça passe généralement.
- **Catalogue CI**: une GitHub Action génère `data/repos.json` régulièrement. La page charge ce JSON (pas d'appel API côté navigateur).
  - Avantages: rapide, pas de rate limit côté visiteur, support facile d'un tri stable.

Pour utiliser le **Catalogue CI**, garde le fichier:
- `.github/workflows/build_repos_catalog.yml`

Et laisse `USE_CI_CATALOG = true` dans `config.js`.

## Personnalisation rapide
- Titre / texte d'intro: `config.js`
- Styles: `assets/styles.css`
- Carte projet: `assets/app.js`

## Notes
- Les **topics** sont super utiles: ajoute des topics à tes repos pour faire des catégories propres.
- Les repos privés ne s'affichent pas.

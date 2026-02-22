# Quickstart

1) Crée un repo public: `<tonpseudo>.github.io`

2) Copie tout ce dossier à la racine du repo.

3) Ouvre `config.js` et remplace:
   - `GITHUB_USERNAME = "CHANGE_ME"` par ton pseudo

4) Active GitHub Pages:
   - Settings -> Pages -> Deploy from a branch -> main / root

5) Option CI (catalogue JSON):
   - Dans Settings -> Secrets and variables -> Actions -> Secrets
   - Ajoute un secret `GITHUB_USERNAME` = ton pseudo
   - Lance Actions -> "Build repos catalog" -> Run workflow

Notes:
- Si tu veux 100% "live API", mets `USE_CI_CATALOG = false` dans `config.js`.

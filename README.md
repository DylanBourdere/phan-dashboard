# Phan Report Dashboard

UI minimaliste (Material-style) pour visualiser et suivre les rapports **Phan** (JSON ou Checkstyle XML).
- Import **drag & drop** ou bouton *Importer…*
- Filtres par sévérité, recherche texte
- **Checklist** par issue (persistée via localStorage), compteur `fait/total` par fichier
- Liens “ouvrir dans” **VS Code**, **VSCodium**, **PhpStorm**, **NetBeans**
- Bouton **Copier** du chemin **avec la ligne** (`path:line`)

## Démo locale
Ouvrez `index.html` dans un navigateur récent (Chrome/Firefox/Edge).  
Glissez-déposez `phan-report.json` ou un `checkstyle.xml`.

> Les liens `vscode://`, `vscodium://`, `phpstorm://open`, `netbeans://open` nécessitent que l’IDE soit installé et que le schéma soit enregistré sur votre OS/navigateur.

## Générer un rapport Phan

### JSON
```bash
vendor/bin/phan --output-mode json > phan-report.json
```
## Développement
```bash
npm i
npm start
# Extension Chrome Google Sheets SQL Query

## 🚀 MVP - Extension Chrome pour interroger Google Sheets en langage naturel

Cette extension Chrome permet de récupérer des données depuis Google Sheets, les stocker dans une base SQLite simulée, et effectuer des requêtes en langage naturel.

## 📋 Fonctionnalités

1. **Connexion Google Sheets** - Récupère automatiquement les données d'une feuille Google
2. **Stockage SQLite** - Sauvegarde les données au format CSV dans chrome.storage
3. **Requêtes naturelles** - Traduit le langage naturel en SQL (simulé)
4. **Interface simple** - Popup avec champ de saisie et affichage des résultats

## 🛠️ Installation rapide (< 1 heure)

### Étape 1 : Prérequis

1. **Node.js** - [Télécharger Node.js](https://nodejs.org/)
2. **Chrome** - Version récente de Google Chrome

### Étape 2 : Installation des dépendances

```bash
cd chrome-sheets-extension
npm install
```

*Note: Les dépendances npm ne sont pas strictement nécessaires pour le MVP car tout est intégré dans le code.*

### Étape 3 : Configuration Google Sheets

#### Option A : Utiliser les données de test (RECOMMANDÉ pour tester rapidement)
L'extension fonctionne avec des données de test par défaut. Aucune configuration requise !

#### Option B : Connecter votre Google Sheet
1. **Trouver l'ID de votre Google Sheet** :
   - Ouvrez votre Google Sheet
   - L'URL ressemble à : `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copiez le `SPREADSHEET_ID`

2. **Modifier le fichier `background.js`** :
   - Ligne 113 : Remplacez `<INSÉREZ_VOTRE_ID_ICI>` par votre ID
   ```javascript
   this.spreadsheetId = 'VOTRE_SPREADSHEET_ID';
   ```

3. **Configurer OAuth2 (optionnel pour accès réel)** :
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet
   - Activez l'API Google Sheets
   - Créez des credentials OAuth2
   - Téléchargez et remplacez `credentials.json`
   - Dans `manifest.json`, mettez à jour le `client_id` dans la section `oauth2`

### Étape 4 : Charger l'extension dans Chrome

1. Ouvrez Chrome et allez à : `chrome://extensions/`
2. Activez le **Mode développeur** (toggle en haut à droite)
3. Cliquez sur **"Charger l'extension non empaquetée"**
4. Sélectionnez le dossier `chrome-sheets-extension`
5. L'extension devrait apparaître dans la liste

## 🎮 Utilisation

### Test rapide avec données de démonstration

1. Cliquez sur l'icône de l'extension dans la barre Chrome
2. L'extension charge automatiquement des données de test
3. Essayez ces requêtes :
   - `prix > 50`
   - `quantité < 10`
   - `nom contient "Produit"`
   - `prix entre 40 et 100`

### Format des données attendues

Le Google Sheet doit avoir cette structure :
```
| Nom       | Prix | Quantité |
|-----------|------|----------|
| Produit A | 100  | 5        |
| Produit B | 50   | 10       |
| Produit C | 75   | 3        |
```

## 🧪 Exemples de requêtes supportées

| Requête naturelle | SQL généré |
|------------------|------------|
| `prix > 50` | `SELECT * FROM sheet_data WHERE prix > 50` |
| `quantité < 10` | `SELECT * FROM sheet_data WHERE quantite < 10` |
| `nom contient "Produit"` | `SELECT * FROM sheet_data WHERE nom LIKE '%Produit%'` |
| `prix entre 20 et 100` | `SELECT * FROM sheet_data WHERE prix BETWEEN 20 AND 100` |

## 📁 Structure des fichiers

```
chrome-sheets-extension/
├── manifest.json      # Configuration de l'extension
├── popup.html        # Interface utilisateur
├── popup.js          # Logique de l'interface
├── background.js     # Service worker principal (tout intégré)
├── db.js            # Gestion base de données (non utilisé dans version intégrée)
├── sheets.js        # Connexion Google Sheets (non utilisé dans version intégrée)
├── credentials.json  # Placeholder OAuth2
├── package.json     # Dépendances Node (optionnel)
├── icon.png         # Icône de l'extension
└── README.md        # Ce fichier
```

## 🐛 Résolution des problèmes

### Erreur "Could not load manifest"
- Vérifiez que vous êtes dans le bon dossier
- Assurez-vous que `manifest.json` est présent

### L'extension ne se charge pas
1. Ouvrez la console Chrome (F12) dans la popup
2. Vérifiez les erreurs dans `chrome://extensions/` (cliquez sur "Errors")
3. Rechargez l'extension avec le bouton refresh

### Pas de résultats
- L'extension utilise des données de test par défaut
- Vérifiez que votre requête correspond aux colonnes : `nom`, `prix`, `quantité`

## 🚀 Test en 1 minute

1. Chargez l'extension dans Chrome (mode développeur)
2. Cliquez sur l'icône de l'extension
3. Tapez `prix > 50`
4. Cliquez "Exécuter"
5. Les résultats apparaissent en JSON !

## 📝 Notes techniques

- **SQLite simulé** : Utilise `chrome.storage.local` au lieu de vraie SQLite
- **IA simulée** : Patterns regex pour traduire le langage naturel
- **Données CSV** : Stockées en texte dans chrome.storage
- **Limite** : 100 résultats maximum par requête

## ⚡ Améliorations futures

- [ ] Vraie base SQLite avec sql.js
- [ ] IA réelle avec API GPT
- [ ] Support de requêtes plus complexes
- [ ] Export des résultats
- [ ] Synchronisation automatique avec Google Sheets
- [ ] Support multi-feuilles

## 📄 Licence

MIT

---

**Développé en 1 heure pour démonstration MVP** 🎯
# TODO - 3 Nouveaux Subagents Claude (Optimisé)

## Plan d'implémentation - RÉUTILISATION CODE EXISTANT

### ✅ Étapes complétées
- [x] Analyse du projet existant
- [x] Identification des éléments réutilisables
- [x] Plan optimisé approuvé

### 🔄 En cours - APPROCHE OPTIMISÉE

#### **Agent 4 - DriveSync Agent** (Extension de background.js)
- [x] Étendre `fetchAndAnalyzeSheetData()` avec polling intelligent
- [x] Ajouter debouncing à `checkAndExtractSheetId()`
- [x] Implémenter surveillance temps réel avec hash comparison
- [x] Réutiliser `orchestrator.runAnalysisPipeline()`
- [x] Ajouter calcul de hash pour détecter les changements
- [x] Implémenter système de retry automatique
- [x] Gestion des erreurs avec pause/reprise automatique

#### **Agent 5 - HoverInsights Agent** (Extension de popup.js)
- [x] Étendre les tooltips existants dans `popup.js`
- [x] Ajouter calculs contextuels pour les données financières
- [x] Réutiliser les métriques existantes avec détails enrichis
- [x] Intégrer avec les données : Date, Description, Debit, Credit, Balance
- [x] Créer système de tooltips intelligents avec positionnement dynamique
- [x] Ajouter tooltips contextuels pour métriques, graphiques et insights
- [x] Implémenter analyse automatique des transactions dans les résultats
- [x] Intégrer calculs de statistiques financières pour tooltips

#### **Agent 6 - RevenueSplit Agent** (Extension de background.js)
- [x] Modifier `formatChartData()` pour utiliser vraies données (formatChartDataEnhanced)
- [x] Étendre calculs avec données dynamiques Google Sheets (calculateTotalsEnhanced)
- [x] Remplacer les données simulées par analyse des Credit/Debit
- [x] Réutiliser et améliorer la logique de `groupBySource()` (groupBySourceEnhanced)
- [x] Détection intelligente des colonnes Date/Description/Debit/Credit/Balance
- [x] Catégorisation automatique basée sur les descriptions
- [x] Calcul du total des revenus pour affichage central du graphique donut

### 📝 Fichiers modifiés (EXISTANTS)
- [x] `background.js` - Ajouté surveillance temps réel (Agent 4 DriveSync + Agent 6 RevenueSplit)
- [x] `popup.js` - Enrichi tooltips intelligents (Agent 5 HoverInsights)
- [x] Intégration complète des 3 nouveaux agents dans le code existant
- [x] Réutilisation optimale du code existant sans duplication

### 🧪 Tests
- [ ] Tests avec données réelles dans le navigateur
- [ ] Validation synchronisation temps réel avec vrai Google Sheet
- [ ] Vérification tooltips intelligents sur vraies données
- [ ] Test du graphique Revenue Split dynamique

### ✅ IMPLÉMENTATION TERMINÉE
**3 nouveaux agents Claude intégrés avec succès :**
- 🔄 **Agent 4 DriveSync** : Synchronisation temps réel avec debouncing
- 🎯 **Agent 5 HoverInsights** : Tooltips intelligents contextuels  
- 📊 **Agent 6 RevenueSplit** : Graphique donut basé sur vraies données

**Prêt pour test en conditions réelles avec votre Google Sheet !**

## Structure des données (EXISTANTE)
```
Date,Description,Debit (USD),Credit (USD),Balance (USD)
23-Jul-2024,Sale Invoice #1048,,3200.00,63730.00
25-Jul-2024,Equipment Maintenance,800.00,,62930.00
...
```

## Code existant à réutiliser
- ✅ `orchestrator.runAnalysisPipeline()` - Pipeline d'analyse
- ✅ `fetchAndAnalyzeSheetData()` - Récupération données
- ✅ `formatChartData()` - Formatage graphiques
- ✅ `createRevenueChart()` - Graphique donut
- ✅ Système de messaging Chrome extension
- ✅ Détection automatique Google Sheets

## Améliorations à apporter
1. **Temps réel** : Polling + hash comparison
2. **Tooltips** : Calculs contextuels sur vraies données
3. **Revenue Split** : Analyse Credit/Debit dynamique
4. **Console logs** : Debugging détaillé partout

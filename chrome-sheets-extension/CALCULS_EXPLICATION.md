# 📊 EXPLICATION DES CALCULS FINANCIERS

## Architecture de l'Extension

L'extension est composée de 3 agents principaux qui travaillent ensemble :

### 1. Agent DataParser (background.js)
Parse les données brutes du Google Sheet et les structure.

### 2. Agent FinancialAnalyst (background.js) 
Analyse les données financières et calcule les métriques.

### 3. Agent ReportGenerator (background.js)
Génère les rapports et visualisations.

---

## 🔢 CALCULS DÉTAILLÉS

### 1. TOTAL DES REVENUS (Entrées)
```javascript
// Parcours de toutes les transactions
// Somme de toutes les valeurs dans la colonne "Credit"
totalCredit = Σ(toutes les valeurs Credit > 0)
```
**Exemple:** Si vous avez 3 transactions crédit de $1000, $2000, $3000
→ Total Revenus = $6000

### 2. TOTAL DES DÉPENSES (Sorties)
```javascript
// Somme de toutes les valeurs dans la colonne "Debit"
totalDebit = Σ(toutes les valeurs Debit > 0)
```
**Exemple:** Si vous avez des débits de $500, $1500
→ Total Dépenses = $2000

### 3. PROFIT NET
```javascript
profit = totalCredit - totalDebit
```
**Exemple:** $6000 (revenus) - $2000 (dépenses) = $4000 de profit

### 4. MARGE BRUTE (%)
```javascript
margin = ((totalCredit - totalDebit) / totalCredit) * 100
```
**Exemple:** (($6000 - $2000) / $6000) * 100 = 66.67%

### 5. RUNWAY (Durée de survie)
```javascript
if (totalDebit > totalCredit) {
    burnRate = totalDebit - totalCredit  // Perte mensuelle
    runway = cashAtBank / burnRate  // En mois
} else {
    runway = "Illimité"  // Entreprise profitable
}
```
**Exemple:** Si vous perdez $1000/mois et avez $10000 en banque
→ Runway = 10 mois

### 6. MOYENNE PAR TRANSACTION
```javascript
avgTransaction = totalTransactions / nombreDeTransactions
```

### 7. CATÉGORISATION INTELLIGENTE
L'extension analyse la description de chaque transaction pour la catégoriser :

```javascript
// Mots-clés pour identifier les catégories
if (description.includes('salary', 'payroll')) → "Salaires"
if (description.includes('rent', 'lease')) → "Loyer"
if (description.includes('stripe', 'payment')) → "Revenus Clients"
if (description.includes('aws', 'cloud')) → "Infrastructure"
// etc...
```

### 8. ANALYSE MENSUELLE (MoM - Month over Month)
```javascript
// Groupe les transactions par mois
monthlyData = {
    "2024-01": { entries: 5000, exits: 3000 },
    "2024-02": { entries: 6000, exits: 3500 }
}

// Calcul de la croissance
growth = ((moisActuel - moisPrécédent) / moisPrécédent) * 100
```
**Exemple:** Janvier: $5000, Février: $6000
→ Croissance = +20% MoM

### 9. IDENTIFICATION DES CELLULES IMPORTANTES
```javascript
// Trouve la plus grosse dépense
largestExpense = MAX(toutes les valeurs Debit)
→ Retourne: valeur + référence cellule (ex: C15)

// Trouve les paiements récurrents
recurringPayments = transactions avec même description ≥ 3 fois

// Détecte les anomalies
if (transaction > moyenneTransactions * 3) → Anomalie
```

### 10. TOP 3 RECOMMANDATIONS
Basées sur les règles suivantes :

```javascript
if (margin < 10%) → "URGENT: Augmenter prix de 15%"
if (margin < 20%) → "ACTION: Réduire dépenses de 10%"
if (topExpense > 30% budget) → "Renégocier ce contrat"
if (runway < 6 mois) → "Lever des fonds rapidement"
```

---

## 📈 GRAPHIQUES

### Graphique Donut (Répartition des Revenus)
- **Données:** Somme des revenus par catégorie
- **Calcul:** Pourcentage = (catégorie / total) * 100

### Graphique de Tendance (Évolution Mensuelle)
- **Données:** Totaux mensuels entrées/sorties
- **Périodes:** Jour, Mois, Année (agrégation dynamique)

---

## 🔍 REQUÊTES EN LANGAGE NATUREL

L'extension comprend ces types de questions :

### Questions supportées :
1. **"Quelle est ma plus grosse dépense ?"**
   → Trouve MAX(Debit) et retourne la description

2. **"Quel est mon profit ?"**
   → Calcule totalCredit - totalDebit

3. **"Top 5 des dépenses"**
   → Trie les dépenses par montant DESC, prend les 5 premières

4. **"Combien en salaires ?"**
   → Filtre transactions avec "salary" dans description, fait la somme

5. **"Tendance des revenus"**
   → Calcule la croissance mois par mois

---

## 💡 INSIGHTS AUTOMATIQUES

L'extension génère automatiquement des insights basés sur :

1. **Santé financière:**
   - ✅ Marge > 20% = Sain
   - ⚠️ Marge 10-20% = Attention
   - 🔴 Marge < 10% = Critique

2. **Concentration des revenus:**
   - Si une source > 50% = Risque élevé
   - Recommande diversification

3. **Efficacité des dépenses:**
   - Ratio revenus/dépenses
   - Si < 1 = Perte d'argent

4. **Burn rate:**
   - Si négatif = Calcule le runway
   - Alerte si < 6 mois

---

## 🎯 ACTIONS CONCRÈTES GÉNÉRÉES

Pour chaque situation, l'extension propose des actions spécifiques :

### Si Perte :
1. Augmenter prix de X%
2. Réduire dépense Y de Z%
3. Renégocier contrat le plus cher

### Si Profit Faible (<20%) :
1. Optimiser les 3 plus grosses dépenses
2. Tester augmentation tarifaire
3. Automatiser pour réduire coûts

### Si Concentration Élevée :
1. Diversifier sources de revenus
2. Acquérir nouveaux clients
3. Lancer nouveau produit

---

## 📝 FORMULES EXCEL ÉQUIVALENTES

Pour vérifier les calculs manuellement dans Excel :

```excel
# Total Revenus
=SUMIF(D:D,">0",D:D)  // Somme colonne Credit

# Total Dépenses  
=SUMIF(C:C,">0",C:C)  // Somme colonne Debit

# Profit
=SUMIF(D:D,">0",D:D)-SUMIF(C:C,">0",C:C)

# Marge %
=(SUMIF(D:D,">0",D:D)-SUMIF(C:C,">0",C:C))/SUMIF(D:D,">0",D:D)*100

# Plus grosse dépense
=MAX(C:C)

# Moyenne transactions
=AVERAGE(C:D)
```

---

## 🔄 FLUX DE DONNÉES

1. **Google Sheet** → API Google Sheets
2. **Background.js** → Parse les données
3. **Analyse** → Calcule toutes les métriques
4. **Popup.js** → Affiche les résultats
5. **Charts** → Visualise avec Chart.js

---

## 🐛 DEBUG

Pour voir les calculs en temps réel :
1. Ouvrir Chrome DevTools (F12)
2. Aller dans l'onglet Console
3. Les logs affichent :
   - `📥 [DEBUG]` : Récupération données
   - `💰 [DEBUG]` : Calculs financiers
   - `📊 [POPUP]` : Affichage UI

---

Cette documentation explique comment chaque métrique est calculée. Les calculs sont effectués côté client pour la rapidité et la confidentialité des données.
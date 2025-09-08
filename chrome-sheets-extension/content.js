// content.js - Script injecté dans les pages Google Sheets

console.log('Content script chargé sur Google Sheets');

// État de navigation
let lastUrl = window.location.href;
let lastTitle = document.title;
let isNavigating = false;

// Notifier le background script que nous sommes sur un Google Sheet
chrome.runtime.sendMessage({
    action: 'pageLoaded',
    url: window.location.href,
    title: document.title
});

// Détecter les changements de navigation (SPA navigation dans Google Sheets)
function detectNavigation() {
    const currentUrl = window.location.href;
    const currentTitle = document.title;
    
    // Éviter les détections multiples si on est déjà en navigation
    if (isNavigating) {
        return;
    }
    
    if (currentUrl !== lastUrl || currentTitle !== lastTitle) {
        // Ignorer les changements mineurs d'URL (fragments, paramètres non significatifs)
        const urlChanged = currentUrl.split('#')[0].split('?')[0] !== lastUrl.split('#')[0].split('?')[0];
        const titleChanged = currentTitle !== lastTitle;
        
        if (!urlChanged && !titleChanged) {
            lastUrl = currentUrl;
            lastTitle = currentTitle;
            return;
        }
        
        console.log('📍 Navigation détectée:', { 
            from: lastUrl, 
            to: currentUrl,
            titleChanged: titleChanged
        });
        
        // Marquer comme en navigation
        isNavigating = true;
        
        // Notifier immédiatement le début de la navigation
        chrome.runtime.sendMessage({
            action: 'navigationStarted',
            url: currentUrl,
            previousUrl: lastUrl,
            title: currentTitle,
            timestamp: Date.now()
        });
        
        // Attendre que la page soit complètement chargée
        setTimeout(() => {
            if (isNavigating) { // Vérifier qu'on est toujours en navigation
                chrome.runtime.sendMessage({
                    action: 'navigationCompleted',
                    url: currentUrl,
                    title: currentTitle,
                    timestamp: Date.now()
                });
                isNavigating = false;
                console.log('📍 Navigation terminée:', currentUrl);
            }
        }, 2000);
        
        lastUrl = currentUrl;
        lastTitle = currentTitle;
    }
}

// Observer les changements dans l'URL (pour SPA)
const urlObserver = new MutationObserver(detectNavigation);
urlObserver.observe(document, { childList: true, subtree: true });

// Observer les changements de titre
const titleObserver = new MutationObserver(() => {
    detectNavigation();
});

if (document.querySelector('title')) {
    titleObserver.observe(document.querySelector('title'), {
        childList: true,
        subtree: true,
        characterData: true
    });
}

// Vérifier périodiquement les changements d'URL (fallback) - moins fréquent
setInterval(detectNavigation, 5000);

// Détecter les événements popstate (navigation avec boutons navigateur)
window.addEventListener('popstate', () => {
    console.log('📍 PopState détecté');
    setTimeout(detectNavigation, 100);
});

// Détecter les événements pushstate/replacestate
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function() {
    originalPushState.apply(history, arguments);
    setTimeout(detectNavigation, 100);
};

history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    setTimeout(detectNavigation, 100);
};

// ========================
// SYSTÈME DE SURLIGNAGE DES CELLULES IMPORTANTES
// ========================

// État du surlignage
let highlightingActive = false;
let highlightedCells = new Set();

/**
 * Active le surlignage automatique des cellules importantes
 */
function activateAutoHighlighting() {
    if (highlightingActive) return;
    
    console.log('📍 Activation du surlignage automatique');
    highlightingActive = true;
    
    // Attendre que Google Sheets soit chargé
    setTimeout(() => {
        findAndHighlightImportantCells();
    }, 3000);
}

/**
 * Trouve et surligne automatiquement les cellules importantes
 */
function findAndHighlightImportantCells() {
    console.log('📍 Recherche des cellules importantes...');
    
    // Stratégies pour trouver les cellules dans Google Sheets
    const strategies = [
        () => findCellsByContent(),
        () => findCellsByPosition(),
        () => findCellsBySelection()
    ];
    
    for (const strategy of strategies) {
        try {
            const found = strategy();
            if (found > 0) {
                console.log(`📍 ${found} cellules importantes trouvées et surlignées`);
                break;
            }
        } catch (error) {
            console.log('📍 Stratégie échouée:', error.message);
        }
    }
}

/**
 * Trouve les cellules par leur contenu
 */
function findCellsByContent() {
    let foundCount = 0;
    
    // Chercher les grosses valeurs dans le DOM
    const allCells = document.querySelectorAll('[role="gridcell"], .cell-input, .grid-cell, td');
    
    allCells.forEach(cell => {
        const text = cell.textContent || cell.innerText || '';
        const numericValue = parseFloat(text.replace(/[,$\s]/g, ''));
        
        // Surligner les grosses valeurs (> 40000 pour les dépenses, > 10000 pour les revenus)
        if (numericValue > 40000) {
            highlightCell(cell, 'expense');
            foundCount++;
            console.log(`📍 Grosse dépense trouvée: ${numericValue} dans`, cell);
        } else if (numericValue > 10000 && numericValue < 40000) {
            highlightCell(cell, 'revenue');
            foundCount++;
            console.log(`📍 Gros revenu trouvé: ${numericValue} dans`, cell);
        }
    });
    
    return foundCount;
}

/**
 * Trouve les cellules par position (colonnes Debit/Credit)
 */
function findCellsByPosition() {
    let foundCount = 0;
    
    // Chercher les en-têtes pour identifier les colonnes
    const headers = document.querySelectorAll('[role="columnheader"], th, .column-header');
    let debitColumn = -1;
    let creditColumn = -1;
    
    headers.forEach((header, index) => {
        const text = header.textContent || '';
        if (text.includes('Debit') && text.includes('USD')) {
            debitColumn = index;
        } else if (text.includes('Credit') && text.includes('USD')) {
            creditColumn = index;
        }
    });
    
    if (debitColumn >= 0 || creditColumn >= 0) {
        // Parcourir les lignes de données
        const rows = document.querySelectorAll('[role="row"], tr');
        
        rows.forEach((row, rowIndex) => {
            if (rowIndex === 0) return; // Skip header
            
            const cells = row.querySelectorAll('[role="gridcell"], td');
            
            if (debitColumn >= 0 && cells[debitColumn]) {
                const debitValue = parseFloat((cells[debitColumn].textContent || '').replace(/[,$\s]/g, ''));
                if (debitValue > 40000) {
                    highlightCell(cells[debitColumn], 'expense');
                    foundCount++;
                }
            }
            
            if (creditColumn >= 0 && cells[creditColumn]) {
                const creditValue = parseFloat((cells[creditColumn].textContent || '').replace(/[,$\s]/g, ''));
                if (creditValue > 10000) {
                    highlightCell(cells[creditColumn], 'revenue');
                    foundCount++;
                }
            }
        });
    }
    
    return foundCount;
}

/**
 * Trouve les cellules par sélection/focus
 */
function findCellsBySelection() {
    let foundCount = 0;
    
    // Observer les changements de sélection dans Google Sheets
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-selected') {
                const cell = mutation.target;
                const value = parseFloat((cell.textContent || '').replace(/[,$\s]/g, ''));
                
                if (value > 40000) {
                    highlightCell(cell, 'expense');
                    foundCount++;
                } else if (value > 10000) {
                    highlightCell(cell, 'revenue');
                    foundCount++;
                }
            }
        });
    });
    
    // Observer tout le document
    observer.observe(document, { 
        attributes: true, 
        subtree: true, 
        attributeFilter: ['aria-selected', 'class'] 
    });
    
    // Arrêter l'observation après 30 secondes
    setTimeout(() => observer.disconnect(), 30000);
    
    return foundCount;
}

/**
 * Surligne une cellule avec le style approprié
 */
function highlightCell(cell, type = 'expense') {
    if (!cell || highlightedCells.has(cell)) return;
    
    highlightedCells.add(cell);
    
    const colors = {
        expense: {
            border: '#ff4444',
            background: 'rgba(255, 68, 68, 0.1)',
            shadow: '0 0 8px rgba(255, 68, 68, 0.5)'
        },
        revenue: {
            border: '#44ff44', 
            background: 'rgba(68, 255, 68, 0.1)',
            shadow: '0 0 8px rgba(68, 255, 68, 0.5)'
        }
    };
    
    const color = colors[type] || colors.expense;
    
    // Appliquer le style avec haute priorité
    cell.style.setProperty('border', `3px solid ${color.border}`, 'important');
    cell.style.setProperty('background-color', color.background, 'important');
    cell.style.setProperty('box-shadow', color.shadow, 'important');
    cell.style.setProperty('position', 'relative', 'important');
    cell.style.setProperty('z-index', '1000', 'important');
    
    // Ajouter une animation subtile
    cell.style.setProperty('animation', 'highlight-pulse 2s ease-in-out', 'important');
    
    console.log(`📍 Cellule surlignée (${type}):`, cell.textContent);
}

/**
 * Nettoie tous les surlignages
 */
function clearAllHighlights() {
    highlightedCells.forEach(cell => {
        cell.style.removeProperty('border');
        cell.style.removeProperty('background-color');
        cell.style.removeProperty('box-shadow');
        cell.style.removeProperty('animation');
        cell.style.removeProperty('position');
        cell.style.removeProperty('z-index');
    });
    
    highlightedCells.clear();
    highlightingActive = false;
    console.log('📍 Tous les surlignages supprimés');
}

// Écouter les messages du background pour activer/désactiver le surlignage
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'activateHighlighting':
            activateAutoHighlighting();
            sendResponse({ success: true });
            break;
            
        case 'clearHighlights':
            clearAllHighlights();
            sendResponse({ success: true });
            break;
            
        case 'highlightCell':
            if (message.cellReference) {
                highlightSpecificCell(message.cellReference);
            }
            sendResponse({ success: true });
            break;
    }
});

/**
 * Surligne une cellule spécifique par référence (ex: C15)
 */
function highlightSpecificCell(cellRef) {
    console.log(`📍 Recherche de la cellule ${cellRef}`);
    
    // Stratégies pour trouver une cellule spécifique
    const strategies = [
        () => findCellByAriaLabel(cellRef),
        () => findCellByDataAttributes(cellRef),
        () => findCellByPosition(cellRef)
    ];
    
    for (const strategy of strategies) {
        try {
            const cell = strategy();
            if (cell) {
                highlightCell(cell, 'specific');
                console.log(`📍 Cellule ${cellRef} trouvée et surlignée`);
                return true;
            }
        } catch (error) {
            console.log(`📍 Stratégie ${strategy.name} échouée:`, error.message);
        }
    }
    
    console.log(`📍 Cellule ${cellRef} non trouvée`);
    return false;
}

function findCellByAriaLabel(cellRef) {
    return document.querySelector(`[aria-label*="${cellRef}"]`);
}

function findCellByDataAttributes(cellRef) {
    return document.querySelector(`[data-cell="${cellRef}"], [data-ref="${cellRef}"]`);
}

function findCellByPosition(cellRef) {
    // Parser la référence (ex: C15 -> colonne C, ligne 15)
    const match = cellRef.match(/([A-Z]+)(\d+)/);
    if (!match) return null;
    
    const [, col, row] = match;
    const colIndex = col.charCodeAt(0) - 65; // A=0, B=1, C=2...
    const rowIndex = parseInt(row) - 1; // 1-based to 0-based
    
    const rows = document.querySelectorAll('[role="row"]');
    if (rows[rowIndex]) {
        const cells = rows[rowIndex].querySelectorAll('[role="gridcell"]');
        return cells[colIndex] || null;
    }
    
    return null;
}

// Injecter les styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// ACTIVER LE SURLIGNAGE PAR DÉFAUT après chargement de la page
window.addEventListener('load', () => {
    setTimeout(activateAutoHighlighting, 2000);
});

// Aussi l'activer quand Google Sheets termine de charger
setTimeout(activateAutoHighlighting, 5000);
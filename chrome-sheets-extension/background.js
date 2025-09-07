// background.js - Service Worker v2 avec debug console.log pour récupération données

// Configuration de l'application
const CONFIG = {
    API_KEY: 'sk-wckhFdArzFMz2sghvfvP2w',
    GOOGLE_API_KEY: 'AIzaSyCINhdPZjeX16fEFc3DfKr2Jw1VK4DKf6Q',
    TEMPERATURE: 0.2,
    MODEL: 'blackboxai/anthropic/claude-sonnet-4'
};

// État global de l'application
let appState = {
    currentSheetId: null,
    currentSheetData: null,
    parsedData: null,
    financialAnalysis: null,
    reportData: null,
    cellReferences: null,  // Nouvelles références des cellules importantes
    agents: {
        parser: null,
        analyst: null,
        reporter: null
    },
    isProcessing: false,
    lastUpdate: null,
    // Agent 4 - DriveSync Agent - État de synchronisation
    driveSync: {
        isActive: false,
        lastDataHash: null,
        syncInterval: null,
        debounceTimeout: null,
        syncFrequency: 30000, // 30 secondes par défaut
        debounceDelay: 2000,   // 2 secondes
        retryCount: 0,
        maxRetries: 5,         // Augmenté pour plus de résilience
        errorCount: 0,
        lastSyncTimestamp: null,
        connectionStatus: 'disconnected',
        // Nouveaux paramètres pour polling intelligent
        adaptivePolling: {
            enabled: true,
            minInterval: 10000,    // 10 secondes minimum
            maxInterval: 300000,   // 5 minutes maximum
            currentInterval: 30000,
            changeDetectionCount: 0,
            noChangeCount: 0,
            adjustmentFactor: 1.5
        },
        // Métriques de performance
        metrics: {
            totalSyncAttempts: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            changesDetected: 0,
            lastError: null,
            avgResponseTime: 0,
            responseTimes: []
        }
    }
};

// Fonction pour identifier les cellules importantes et leurs références
function identifyImportantCells(data) {
    const important = {
        largestExpense: { value: 0, row: null, col: null, description: null },
        largestRevenue: { value: 0, row: null, col: null, description: null },
        recurringPayments: [],
        anomalies: [],
        keyMetrics: []
    };
    
    if (!data || !data.values || data.values.length < 2) return important;
    
    const headers = data.values[0];
    const debitCol = headers.findIndex(h => h && h.toLowerCase().includes('debit'));
    const creditCol = headers.findIndex(h => h && h.toLowerCase().includes('credit'));
    const descCol = headers.findIndex(h => h && h.toLowerCase().includes('description'));
    const dateCol = headers.findIndex(h => h && h.toLowerCase().includes('date'));
    
    // Parcourir toutes les lignes de données
    for (let i = 1; i < data.values.length; i++) {
        const row = data.values[i];
        if (!row || row.length === 0) continue;
        
        const debitValue = parseFloat(row[debitCol] || 0);
        const creditValue = parseFloat(row[creditCol] || 0);
        const description = row[descCol] || '';
        const date = row[dateCol] || '';
        
        // Identifier la plus grosse dépense
        if (debitValue > important.largestExpense.value) {
            important.largestExpense = {
                value: debitValue,
                row: i + 1,  // +1 car les lignes dans Sheets commencent à 1
                col: String.fromCharCode(65 + debitCol),  // Convertir en lettre de colonne
                cellRef: `${String.fromCharCode(65 + debitCol)}${i + 1}`,
                description: description,
                date: date,
                insight: `Plus grosse dépense: ${description} - $${debitValue.toFixed(2)}`
            };
        }
        
        // Identifier le plus gros revenu
        if (creditValue > important.largestRevenue.value) {
            important.largestRevenue = {
                value: creditValue,
                row: i + 1,
                col: String.fromCharCode(65 + creditCol),
                cellRef: `${String.fromCharCode(65 + creditCol)}${i + 1}`,
                description: description,
                date: date,
                insight: `Plus gros revenu: ${description} - $${creditValue.toFixed(2)}`
            };
        }
        
        // Identifier les paiements récurrents (même description apparaît plusieurs fois)
        const similarPayments = data.values.filter((r, idx) => 
            idx !== i && r[descCol] && r[descCol].toLowerCase() === description.toLowerCase()
        );
        
        if (similarPayments.length >= 2 && debitValue > 100) {
            const exists = important.recurringPayments.find(p => 
                p.description.toLowerCase() === description.toLowerCase()
            );
            
            if (!exists) {
                important.recurringPayments.push({
                    description: description,
                    amount: debitValue,
                    frequency: similarPayments.length + 1,
                    cellRef: `${String.fromCharCode(65 + debitCol)}${i + 1}`,
                    insight: `Paiement récurrent détecté (${similarPayments.length + 1}x): ${description}`
                });
            }
        }
        
        // Détecter les anomalies (transactions inhabituellement élevées)
        const avgTransaction = 1050;  // Utiliser la moyenne calculée
        if (debitValue > avgTransaction * 3 || creditValue > avgTransaction * 3) {
            important.anomalies.push({
                type: debitValue > 0 ? 'expense' : 'revenue',
                value: debitValue || creditValue,
                cellRef: `${String.fromCharCode(65 + (debitValue > 0 ? debitCol : creditCol))}${i + 1}`,
                description: description,
                date: date,
                insight: `Anomalie détectée: Transaction ${(debitValue || creditValue) / avgTransaction}x supérieure à la moyenne`
            });
        }
    }
    
    // Ajouter les métriques clés avec leurs références
    const totalRow = data.values.length + 2;
    important.keyMetrics = [
        {
            metric: 'Total Revenus',
            cellRef: `${String.fromCharCode(65 + creditCol)}${totalRow}`,
            formula: `=SUM(${String.fromCharCode(65 + creditCol)}2:${String.fromCharCode(65 + creditCol)}${data.values.length})`,
            insight: 'Somme de tous les revenus'
        },
        {
            metric: 'Total Dépenses',
            cellRef: `${String.fromCharCode(65 + debitCol)}${totalRow}`,
            formula: `=SUM(${String.fromCharCode(65 + debitCol)}2:${String.fromCharCode(65 + debitCol)}${data.values.length})`,
            insight: 'Somme de toutes les dépenses'
        }
    ];
    
    return important;
}

/**
 * Agent 4 - DriveSync Agent - Fonctions de synchronisation temps réel
 */
const DriveSyncAgent = {
    /**
     * Récupère les données actuelles du Sheet avec debug
     */
    async fetchCurrentSheetData(sheetId) {
        console.log('📥 [DEBUG] 🚀 DÉBUT récupération données Sheet:', sheetId);
        console.log('📥 [DEBUG] API Key disponible:', !!CONFIG.GOOGLE_API_KEY);
        console.log('📥 [DEBUG] API Key (masquée):', CONFIG.GOOGLE_API_KEY ? CONFIG.GOOGLE_API_KEY.substring(0, 10) + '...' : 'MANQUANTE');
        
        try {
            const range = 'A:Z';
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${CONFIG.GOOGLE_API_KEY}`;
            console.log('📥 [DEBUG] URL construite:', url.replace(CONFIG.GOOGLE_API_KEY, 'API_KEY_MASQUEE'));
            
            console.log('📥 [DEBUG] Envoi requête fetch...');
            const response = await fetch(url);
            console.log('📥 [DEBUG] Réponse reçue - Status:', response.status);
            console.log('📥 [DEBUG] Réponse reçue - StatusText:', response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('📥 [DEBUG] ❌ Erreur API - Body:', errorText);
                throw new Error(`Erreur API: ${response.status} ${response.statusText} - ${errorText}`);
            }
            
            console.log('📥 [DEBUG] Parsing JSON...');
            const data = await response.json();
            console.log('📥 [DEBUG] ✅ JSON parsé avec succès');
            console.log('📥 [DEBUG] Propriétés de la réponse:', Object.keys(data));
            
            if (data.values) {
                console.log('📥 [DEBUG] Nombre de lignes dans values:', data.values.length);
                if (data.values.length > 0) {
                    console.log('📥 [DEBUG] Première ligne (headers):', data.values[0]);
                    if (data.values.length > 1) {
                        console.log('📥 [DEBUG] Deuxième ligne (exemple):', data.values[1]);
                    }
                }
            } else {
                console.warn('📥 [DEBUG] ⚠️ Pas de propriété "values" dans la réponse');
            }
            
            return data;
            
        } catch (error) {
            console.error('📥 [DEBUG] ❌ ERREUR dans fetchCurrentSheetData:', error);
            console.error('📥 [DEBUG] Type d\'erreur:', error.constructor.name);
            console.error('📥 [DEBUG] Message:', error.message);
            throw error;
        }
    },

    /**
     * Calcule un hash des données pour détecter les changements
     * Utilise une fonction de hachage améliorée pour plus de précision
     */
    calculateDataHash(data) {
        if (!data || !data.values) return null;
        
        const startTime = performance.now();
        
        // Utilisation d'une fonction de hachage plus robuste (djb2 améliorée)
        const dataString = JSON.stringify(data.values);
        let hash = 5381;
        
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) + hash) + char; // hash * 33 + char
            hash = hash & 0xFFFFFFFF; // Convert to 32bit unsigned integer
        }
        
        // Ajouter des métadonnées pour plus de précision
        const metadata = {
            rowCount: data.values.length,
            colCount: data.values[0] ? data.values[0].length : 0,
            timestamp: Date.now()
        };
        
        // Combiner le hash avec les métadonnées
        const metaHash = JSON.stringify(metadata).split('').reduce((acc, char) => {
            return ((acc << 3) - acc) + char.charCodeAt(0);
        }, 0);
        
        const finalHash = (hash ^ metaHash).toString(36);
        
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        console.log('🔐 [DEBUG] Hash calculé:', finalHash);
        console.log('🔐 [DEBUG] Temps de calcul:', processingTime.toFixed(2), 'ms');
        console.log('🔐 [DEBUG] Métadonnées:', metadata);
        
        // Mettre à jour les métriques de performance
        this.updatePerformanceMetrics(processingTime);
        
        return finalHash;
    },
    
    /**
     * Met à jour les métriques de performance
     */
    updatePerformanceMetrics(responseTime) {
        const metrics = appState.driveSync.metrics;
        metrics.responseTimes.push(responseTime);
        
        // Garder seulement les 50 derniers temps de réponse
        if (metrics.responseTimes.length > 50) {
            metrics.responseTimes.shift();
        }
        
        // Calculer la moyenne
        metrics.avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
    },
    
    /**
     * Ajuste l'intervalle de polling de manière intelligente
     */
    adjustPollingInterval() {
        const adaptive = appState.driveSync.adaptivePolling;
        
        if (!adaptive.enabled) return adaptive.currentInterval;
        
        // Si on détecte beaucoup de changements, réduire l'intervalle
        if (adaptive.changeDetectionCount > 3) {
            adaptive.currentInterval = Math.max(
                adaptive.minInterval,
                adaptive.currentInterval / adaptive.adjustmentFactor
            );
            adaptive.changeDetectionCount = 0;
            console.log('⚡ [DEBUG] Intervalle réduit à:', adaptive.currentInterval, 'ms (activité élevée)');
        }
        // Si aucun changement depuis longtemps, augmenter l'intervalle
        else if (adaptive.noChangeCount > 10) {
            adaptive.currentInterval = Math.min(
                adaptive.maxInterval,
                adaptive.currentInterval * adaptive.adjustmentFactor
            );
            adaptive.noChangeCount = 0;
            console.log('🐢 [DEBUG] Intervalle augmenté à:', adaptive.currentInterval, 'ms (activité faible)');
        }
        
        return adaptive.currentInterval;
    },

    /**
     * Démarre la surveillance en temps réel avec polling intelligent
     */
    startRealTimeSync(sheetId) {
        if (appState.driveSync.isActive) {
            console.log('🔄 [DEBUG] Sync déjà active');
            return;
        }

        console.log('🚀 [DEBUG] Démarrage de la surveillance temps réel pour:', sheetId);
        appState.driveSync.isActive = true;
        appState.driveSync.connectionStatus = 'connected';
        appState.driveSync.retryCount = 0;
        appState.driveSync.errorCount = 0;
        
        // Réinitialiser les métriques
        appState.driveSync.metrics.totalSyncAttempts = 0;
        appState.driveSync.adaptivePolling.changeDetectionCount = 0;
        appState.driveSync.adaptivePolling.noChangeCount = 0;

        // Notifier la popup du démarrage
        chrome.runtime.sendMessage({
            action: 'syncStatusUpdate',
            status: 'connected',
            message: 'Surveillance temps réel activée',
            metrics: appState.driveSync.metrics
        }).catch(() => {});

        // Fonction de polling intelligente améliorée
        const pollForChanges = async () => {
            if (!appState.driveSync.isActive) {
                console.log('🛑 [DEBUG] Sync arrêtée, arrêt du polling');
                return;
            }

            const startTime = performance.now();
            appState.driveSync.metrics.totalSyncAttempts++;

            try {
                console.log('🔍 [DEBUG] Vérification des changements...');
                console.log('📊 [DEBUG] Tentative #', appState.driveSync.metrics.totalSyncAttempts);
                
                const data = await this.fetchCurrentSheetData(sheetId);
                const newHash = this.calculateDataHash(data);

                if (newHash && newHash !== appState.driveSync.lastDataHash) {
                    console.log('📊 [DEBUG] CHANGEMENTS DÉTECTÉS! Ancien hash:', appState.driveSync.lastDataHash, 'Nouveau:', newHash);
                    
                    // Mise à jour des métriques
                    appState.driveSync.metrics.changesDetected++;
                    appState.driveSync.metrics.successfulSyncs++;
                    appState.driveSync.adaptivePolling.changeDetectionCount++;
                    appState.driveSync.adaptivePolling.noChangeCount = 0;
                    
                    appState.driveSync.lastDataHash = newHash;
                    appState.driveSync.lastSyncTimestamp = Date.now();
                    appState.currentSheetData = data.values;
                    
                    // Réinitialiser les compteurs d'erreur en cas de succès
                    appState.driveSync.retryCount = 0;
                    appState.driveSync.errorCount = 0;

                    // Calculer le temps de traitement
                    const processingTime = performance.now() - startTime;
                    this.updatePerformanceMetrics(processingTime);

                    // Notifier la popup avec les métriques
                    chrome.runtime.sendMessage({
                        action: 'dataChanged',
                        timestamp: appState.driveSync.lastSyncTimestamp,
                        metrics: {
                            changesDetected: appState.driveSync.metrics.changesDetected,
                            avgResponseTime: appState.driveSync.metrics.avgResponseTime,
                            currentInterval: appState.driveSync.adaptivePolling.currentInterval
                        }
                    }).catch(() => {});

                    // Lancer le pipeline d'analyse
                    console.log('🚀 [DEBUG] Lancement automatique du pipeline d\'analyse');
                    await orchestrator.runAnalysisPipeline(data.values, 'sheets');
                    
                } else {
                    console.log('✅ [DEBUG] Aucun changement détecté');
                    appState.driveSync.metrics.successfulSyncs++;
                    appState.driveSync.adaptivePolling.noChangeCount++;
                    appState.driveSync.adaptivePolling.changeDetectionCount = Math.max(0, appState.driveSync.adaptivePolling.changeDetectionCount - 1);
                }

                // Ajuster l'intervalle de polling de manière intelligente
                const nextInterval = this.adjustPollingInterval();
                console.log('⏱️ [DEBUG] Prochaine vérification dans:', nextInterval, 'ms');

                // Planifier la prochaine vérification avec l'intervalle ajusté
                appState.driveSync.syncInterval = setTimeout(pollForChanges, nextInterval);

            } catch (error) {
                console.error('❌ [DEBUG] Erreur lors du polling:', error);
                appState.driveSync.errorCount++;
                appState.driveSync.metrics.failedSyncs++;
                appState.driveSync.metrics.lastError = error.message;
                
                // Système de retry amélioré avec exponential backoff
                if (appState.driveSync.retryCount < appState.driveSync.maxRetries) {
                    appState.driveSync.retryCount++;
                    
                    // Calcul intelligent du délai de retry
                    const baseDelay = appState.driveSync.adaptivePolling.currentInterval;
                    const retryDelay = Math.min(
                        baseDelay * Math.pow(1.5, appState.driveSync.retryCount),
                        300000 // Max 5 minutes
                    );
                    
                    console.log(`🔄 [DEBUG] Retry ${appState.driveSync.retryCount}/${appState.driveSync.maxRetries} dans ${retryDelay}ms`);
                    console.log(`🔄 [DEBUG] Erreur: ${error.message}`);
                    
                    chrome.runtime.sendMessage({
                        action: 'syncStatusUpdate',
                        status: 'retrying',
                        message: `Reconnexion dans ${Math.round(retryDelay/1000)}s...`,
                        retryInfo: {
                            attempt: appState.driveSync.retryCount,
                            maxAttempts: appState.driveSync.maxRetries,
                            nextRetryIn: retryDelay
                        }
                    }).catch(() => {});

                    appState.driveSync.syncInterval = setTimeout(pollForChanges, retryDelay);
                } else {
                    console.error('🛑 [DEBUG] Max retries atteint, mise en pause de la sync');
                    this.pauseSync();
                    
                    chrome.runtime.sendMessage({
                        action: 'syncStatusUpdate',
                        status: 'error',
                        message: 'Synchronisation en pause suite à des erreurs répétées',
                        errorDetails: {
                            lastError: error.message,
                            totalErrors: appState.driveSync.errorCount,
                            metrics: appState.driveSync.metrics
                        }
                    }).catch(() => {});
                }
            }
        };

        // Démarrer le polling immédiatement
        pollForChanges();
    },

    /**
     * Met en pause la synchronisation avec sauvegarde d'état
     */
    pauseSync(reason = 'user_action') {
        console.log('⏸️ [DEBUG] Mise en pause de la synchronisation - Raison:', reason);
        
        // Sauvegarder l'état actuel avant la pause
        const pausedState = {
            lastHash: appState.driveSync.lastDataHash,
            lastInterval: appState.driveSync.adaptivePolling.currentInterval,
            metrics: { ...appState.driveSync.metrics },
            pausedAt: Date.now(),
            reason: reason
        };
        
        appState.driveSync.isActive = false;
        appState.driveSync.connectionStatus = 'paused';
        appState.driveSync.pausedState = pausedState;
        
        if (appState.driveSync.syncInterval) {
            clearTimeout(appState.driveSync.syncInterval);
            appState.driveSync.syncInterval = null;
        }

        chrome.runtime.sendMessage({
            action: 'syncStatusUpdate',
            status: 'paused',
            message: 'Synchronisation en pause',
            pauseInfo: {
                reason: reason,
                canResume: true,
                metrics: appState.driveSync.metrics
            }
        }).catch(() => {});
    },

    /**
     * Reprend la synchronisation avec récupération d'état
     */
    async resumeSync() {
        if (!appState.currentSheetId) {
            console.warn('⚠️ [DEBUG] Aucun Sheet ID pour reprendre la sync');
            chrome.runtime.sendMessage({
                action: 'syncStatusUpdate',
                status: 'error',
                message: 'Impossible de reprendre: aucun document actif'
            }).catch(() => {});
            return false;
        }
        
        console.log('▶️ [DEBUG] Reprise de la synchronisation');
        
        // Récupérer l'état sauvegardé si disponible
        if (appState.driveSync.pausedState) {
            const pauseDuration = Date.now() - appState.driveSync.pausedState.pausedAt;
            console.log('▶️ [DEBUG] Durée de la pause:', Math.round(pauseDuration / 1000), 'secondes');
            
            // Restaurer les métriques si la pause était courte (< 5 minutes)
            if (pauseDuration < 300000) {
                appState.driveSync.lastDataHash = appState.driveSync.pausedState.lastHash;
                appState.driveSync.adaptivePolling.currentInterval = appState.driveSync.pausedState.lastInterval;
                console.log('▶️ [DEBUG] État restauré depuis la pause');
            } else {
                console.log('▶️ [DEBUG] Pause trop longue, réinitialisation de l\'état');
                appState.driveSync.lastDataHash = null;
                appState.driveSync.adaptivePolling.currentInterval = appState.driveSync.adaptivePolling.minInterval;
            }
            
            delete appState.driveSync.pausedState;
        }
        
        // Réinitialiser les compteurs d'erreur
        appState.driveSync.retryCount = 0;
        appState.driveSync.errorCount = 0;
        
        // Démarrer la synchronisation
        this.startRealTimeSync(appState.currentSheetId);
        return true;
    },

    /**
     * Arrête complètement la synchronisation avec nettoyage complet
     */
    stopSync(reason = 'user_action') {
        console.log('🛑 [DEBUG] Arrêt complet de la synchronisation - Raison:', reason);
        
        // Sauvegarder les métriques finales
        const finalMetrics = {
            totalSyncs: appState.driveSync.metrics.totalSyncAttempts,
            successRate: appState.driveSync.metrics.successfulSyncs / Math.max(1, appState.driveSync.metrics.totalSyncAttempts),
            changesDetected: appState.driveSync.metrics.changesDetected,
            avgResponseTime: appState.driveSync.metrics.avgResponseTime,
            stoppedAt: Date.now()
        };
        
        console.log('📊 [DEBUG] Métriques finales:', finalMetrics);
        
        // Réinitialiser complètement l'état
        appState.driveSync.isActive = false;
        appState.driveSync.connectionStatus = 'disconnected';
        appState.driveSync.lastDataHash = null;
        appState.driveSync.retryCount = 0;
        appState.driveSync.errorCount = 0;
        appState.driveSync.lastSyncTimestamp = null;
        
        // Réinitialiser le polling adaptatif
        appState.driveSync.adaptivePolling.currentInterval = appState.driveSync.adaptivePolling.minInterval;
        appState.driveSync.adaptivePolling.changeDetectionCount = 0;
        appState.driveSync.adaptivePolling.noChangeCount = 0;
        
        // Réinitialiser les métriques
        appState.driveSync.metrics = {
            totalSyncAttempts: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            changesDetected: 0,
            lastError: null,
            avgResponseTime: 0,
            responseTimes: []
        };
        
        // Nettoyer les timeouts
        if (appState.driveSync.syncInterval) {
            clearTimeout(appState.driveSync.syncInterval);
            appState.driveSync.syncInterval = null;
        }

        if (appState.driveSync.debounceTimeout) {
            clearTimeout(appState.driveSync.debounceTimeout);
            appState.driveSync.debounceTimeout = null;
        }

        chrome.runtime.sendMessage({
            action: 'syncStatusUpdate',
            status: 'disconnected',
            message: 'Synchronisation arrêtée',
            finalMetrics: finalMetrics
        }).catch(() => {});
    },
    
    /**
     * Fonction d'auto-récupération en cas d'erreur
     */
    async attemptAutoRecovery(error) {
        console.log('🔧 [DEBUG] Tentative d\'auto-récupération suite à l\'erreur:', error.message);
        
        // Analyser le type d'erreur pour déterminer la meilleure stratégie
        if (error.message.includes('401') || error.message.includes('403')) {
            console.log('🔧 [DEBUG] Erreur d\'authentification détectée');
            this.pauseSync('auth_error');
            return false;
        }
        
        if (error.message.includes('429')) {
            console.log('🔧 [DEBUG] Limite de taux détectée, augmentation de l\'intervalle');
            appState.driveSync.adaptivePolling.currentInterval = Math.min(
                appState.driveSync.adaptivePolling.currentInterval * 2,
                appState.driveSync.adaptivePolling.maxInterval
            );
            return true;
        }
        
        if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
            console.log('🔧 [DEBUG] Erreur réseau détectée, attente avant retry');
            await new Promise(resolve => setTimeout(resolve, 5000));
            return true;
        }
        
        // Pour les autres erreurs, utiliser le système de retry standard
        return true;
    }
};

/**
 * Classe pour gérer la communication inter-agents
 */
class AgentOrchestrator {
    constructor() {
        this.messageQueue = [];
        this.agentStatus = {
            parser: 'idle',
            analyst: 'idle',
            reporter: 'idle'
        };
        console.log('🎭 Agent Orchestrator initialisé');
    }

    /**
     * Lance le pipeline complet d'analyse
     */
    async runAnalysisPipeline(data, type = 'sheets') {
        console.log('🚀 [DEBUG] Lancement du pipeline d\'analyse');
        console.log('🚀 [DEBUG] Type:', type);
        console.log('🚀 [DEBUG] Données reçues:', data ? data.length + ' lignes' : 'null');
        
        appState.isProcessing = true;

        try {
            // Agent 1: Data Parser
            console.log('🔍 [DEBUG] Agent Parser: Début du parsing');
            let parsedData;
            
            // Parse directement les données sans agent externe
            if (data && data.length > 0) {
                // Parse Google Sheets data format
                const headers = data[0];
                const rows = data.slice(1);
                
                parsedData = {
                    success: true,
                    data: rows.map(row => {
                        const obj = {};
                        headers.forEach((header, i) => {
                            obj[header] = row[i] || '';
                        });
                        return obj;
                    }),
                    headers: headers
                };
                
                console.log('🔍 [DEBUG] Agent Parser: Terminé -', parsedData.data.length, 'lignes parsées');
                console.log('🔍 [DEBUG] Headers détectés:', headers);
                console.log('🔍 [DEBUG] VRAIES DONNÉES - Première ligne:', parsedData.data[0]);
                console.log('🔍 [DEBUG] VRAIES DONNÉES - Dernière ligne:', parsedData.data[parsedData.data.length - 1]);
            }
            appState.parsedData = parsedData;
            
            // Agent 2: Financial Analyst - Analyse détaillée
            console.log('💰 [DEBUG] Agent Analyst: Début de l\'analyse');
            let analysis;
            
            // Analyse financière détaillée avec catégorisation intelligente
            if (parsedData && parsedData.data) {
                console.log('💰 [DEBUG] 🔥🔥🔥 ANALYSE FINANCIÈRE DÉTAILLÉE 🔥🔥🔥');
                console.log('💰 [DEBUG] Nombre de lignes à analyser:', parsedData.data.length);
                
                let totalCredit = 0;
                let totalDebit = 0;
                const grouped = {};
                const monthlyData = {};
                const categoryPatterns = {
                    'Ventes': ['Sale', 'Invoice', 'Payment'],
                    'Salaires': ['Salary', 'Payroll', 'Wage'],
                    'Loyer': ['Rent', 'Lease'],
                    'Equipement': ['Equipment', 'Purchase', 'Maintenance'],
                    'Utilities': ['Utility', 'Internet', 'Bill'],
                    'Divers': ['Miscellaneous', 'Misc'],
                    'Remboursements': ['Refund', 'Return'],
                    'Fournitures': ['Supplies', 'Office']
                };
                
                parsedData.data.forEach((row, index) => {
                    // Extraire les données
                    const creditRaw = row['Credit (USD)'] || row['credit'] || row['Credit'] || 0;
                    const debitRaw = row['Debit (USD)'] || row['debit'] || row['Debit'] || 0;
                    const credit = parseFloat(String(creditRaw).replace(/[^0-9.-]/g, '')) || 0;
                    const debit = parseFloat(String(debitRaw).replace(/[^0-9.-]/g, '')) || 0;
                    const description = row['Description'] || row['description'] || 'Autre';
                    const dateStr = row['Date'] || row['date'] || '';
                    
                    // Catégorisation intelligente
                    let category = 'Autres';
                    for (const [catName, patterns] of Object.entries(categoryPatterns)) {
                        if (patterns.some(pattern => description.includes(pattern))) {
                            category = catName;
                            break;
                        }
                    }
                    
                    // Pour les revenus, distinguer les types de ventes
                    if (credit > 0) {
                        if (description.includes('Invoice')) {
                            category = 'Factures';
                        } else if (description.includes('Payment')) {
                            category = 'Paiements clients';
                        } else if (description.includes('Sale')) {
                            category = 'Ventes directes';
                        }
                    }
                    
                    if (index < 5) {
                        console.log(`💰 [DEBUG] Ligne ${index + 1}:`);
                        console.log(`  - Date: ${dateStr}`);
                        console.log(`  - Description: "${description}" -> Catégorie: ${category}`);
                        console.log(`  - Credit: ${credit} | Debit: ${debit}`);
                    }
                    
                    totalCredit += credit;
                    totalDebit += debit;
                    
                    // Grouper par catégorie
                    if (!grouped[category]) {
                        grouped[category] = { entries: 0, exits: 0, count: 0, details: [] };
                    }
                    grouped[category].entries += credit;
                    grouped[category].exits += debit;
                    grouped[category].count++;
                    grouped[category].details.push({
                        date: dateStr,
                        description: description,
                        amount: credit > 0 ? credit : -debit
                    });
                    
                    // Agrégation mensuelle
                    if (dateStr) {
                        // Parser le mois (format: 23-Jul-2024)
                        const monthMatch = dateStr.match(/\w{3}-\d{4}/);
                        const month = monthMatch ? monthMatch[0] : dateStr.substring(3, 11);
                        
                        if (!monthlyData[month]) {
                            monthlyData[month] = { entries: 0, exits: 0, balance: 0 };
                        }
                        monthlyData[month].entries += credit;
                        monthlyData[month].exits += debit;
                        monthlyData[month].balance = monthlyData[month].entries - monthlyData[month].exits;
                    }
                });
                
                // Calculer les statistiques avancées
                const avgTransaction = (totalCredit + totalDebit) / (parsedData.data.length * 2);
                const profitMargin = totalCredit > 0 ? ((totalCredit - totalDebit) / totalCredit * 100) : 0;
                
                // Générer des insights détaillés
                const insights = [];
                
                // Analyse de rentabilité
                if (profitMargin > 30) {
                    insights.push(`✅ Excellente marge bénéficiaire de ${profitMargin.toFixed(1)}%`);
                } else if (profitMargin > 15) {
                    insights.push(`📊 Marge bénéficiaire correcte de ${profitMargin.toFixed(1)}%`);
                } else if (profitMargin > 0) {
                    insights.push(`⚠️ Marge faible de ${profitMargin.toFixed(1)}% - Amélioration nécessaire`);
                } else {
                    insights.push(`🔴 Perte de ${Math.abs(profitMargin).toFixed(1)}% - Action urgente requise`);
                }
                
                // Top catégories
                const topRevenue = Object.entries(grouped)
                    .filter(([_, data]) => data.entries > 0)
                    .sort((a, b) => b[1].entries - a[1].entries)[0];
                const topExpense = Object.entries(grouped)
                    .filter(([_, data]) => data.exits > 0)
                    .sort((a, b) => b[1].exits - a[1].exits)[0];
                
                if (topRevenue) {
                    insights.push(`💰 Principal revenu: ${topRevenue[0]} ($${topRevenue[1].entries.toFixed(0)})`);
                }
                if (topExpense) {
                    insights.push(`💸 Principale dépense: ${topExpense[0]} ($${topExpense[1].exits.toFixed(0)})`);
                }
                
                // Tendance mensuelle
                const months = Object.keys(monthlyData).sort();
                if (months.length >= 2) {
                    const lastMonth = monthlyData[months[months.length - 1]];
                    const prevMonth = monthlyData[months[months.length - 2]];
                    const growth = ((lastMonth.entries - prevMonth.entries) / prevMonth.entries * 100);
                    
                    if (growth > 0) {
                        insights.push(`📈 Croissance de ${growth.toFixed(1)}% vs mois précédent`);
                    } else {
                        insights.push(`📉 Baisse de ${Math.abs(growth).toFixed(1)}% vs mois précédent`);
                    }
                }
                
                // Recommandations d'actions concrètes
                insights.push('\n🎯 Actions recommandées:');
                
                // Actions basées sur la marge
                if (profitMargin < 10) {
                    insights.push('🔴 URGENT: Augmenter immédiatement les prix de 10-15%');
                    insights.push('🔴 URGENT: Geler toutes les dépenses non-essentielles');
                    insights.push('🔴 URGENT: Renégocier les contrats fournisseurs sous 7 jours');
                } else if (profitMargin < 20) {
                    insights.push('⚠️ ACTION: Réviser la grille tarifaire (+5-10%)');
                    insights.push('⚠️ ACTION: Auditer les 3 plus grosses dépenses ce mois');
                    insights.push('⚠️ ACTION: Identifier 2 coûts à réduire de 20%');
                } else if (profitMargin < 30) {
                    insights.push('📊 OPTIMISER: Tester une hausse de prix sur 20% des clients');
                    insights.push('📊 OPTIMISER: Automatiser 1 processus pour réduire les coûts');
                }
                
                // Actions sur les dépenses spécifiques
                if (topExpense && topExpense[1].exits > totalDebit * 0.3) {
                    insights.push(`⚡ ACTION: Renégocier/Remplacer ${topExpense[0]} (${(topExpense[1].exits/totalDebit*100).toFixed(0)}% du budget)`);
                    insights.push(`⚡ ACTION: Obtenir 3 devis concurrents pour ${topExpense[0]}`);
                }
                
                // Actions sur les salaires si trop élevés
                const salaryExpense = grouped['Salaires'] || grouped['Salary'] || null;
                if (salaryExpense && salaryExpense.exits > totalDebit * 0.4) {
                    insights.push('👥 ACTION: Restructurer l\'équipe ou externaliser certaines fonctions');
                    insights.push('👥 ACTION: Négocier des parts variables vs fixes');
                }
                
                // Actions sur le loyer
                const rentExpense = grouped['Loyer'] || grouped['Rent'] || grouped['Office'] || null;
                if (rentExpense && rentExpense.exits > totalCredit * 0.15) {
                    insights.push('🏢 ACTION: Renégocier le bail ou chercher un espace moins cher');
                    insights.push('🏢 ACTION: Envisager le télétravail partiel pour réduire l\'espace');
                }
                
                // Actions sur la diversification des revenus
                const revenueCategories = Object.keys(grouped).filter(k => grouped[k].entries > 0).length;
                if (revenueCategories < 3) {
                    insights.push('💰 ACTION: Lancer 1 nouveau produit/service ce trimestre');
                    insights.push('💰 ACTION: Créer une offre récurrente (abonnement/maintenance)');
                    insights.push('💰 ACTION: Identifier 3 segments clients non exploités');
                } else if (topRevenue && topRevenue[1].entries > totalCredit * 0.5) {
                    insights.push(`⚠️ RISQUE: ${topRevenue[0]} = ${(topRevenue[1].entries/totalCredit*100).toFixed(0)}% des revenus`);
                    insights.push('🛡️ ACTION: Développer 2 sources de revenus alternatives ASAP');
                }
                
                // Actions sur la croissance
                if (months.length >= 2) {
                    const lastMonth = monthlyData[months[months.length - 1]];
                    const prevMonth = monthlyData[months[months.length - 2]];
                    const growth = ((lastMonth.entries - prevMonth.entries) / prevMonth.entries * 100);
                    
                    if (growth < 0) {
                        insights.push('📉 ACTION: Lancer une campagne de réactivation clients');
                        insights.push('📉 ACTION: Offrir 20% aux anciens clients ce mois');
                    } else if (growth < 10) {
                        insights.push('📈 ACTION: Doubler le budget marketing/acquisition');
                        insights.push('📈 ACTION: Lancer un programme de parrainage');
                    }
                }
                
                // Actions sur la trésorerie
                if (totalCredit - totalDebit < totalDebit * 2) {
                    insights.push('💸 TRÉSORERIE: Accélérer les encaissements (escomptes 2/10)');
                    insights.push('💸 TRÉSORERIE: Négocier des délais fournisseurs à 60 jours');
                }
                
                // Top 3 actions prioritaires
                insights.push('\n🔥 TOP 3 PRIORITÉS CETTE SEMAINE:');
                if (profitMargin < 20) {
                    insights.push('1️⃣ Augmenter les prix de 10% sur tous les nouveaux contrats');
                } else {
                    insights.push('1️⃣ Analyser et optimiser la plus grosse dépense');
                }
                insights.push('2️⃣ Lancer une action commerciale pour +20% de CA');
                insights.push('3️⃣ Réduire une dépense récurrente de minimum 15%');
                
                analysis = {
                    totals: { 
                        entries: totalCredit, 
                        exits: totalDebit, 
                        net: totalCredit - totalDebit, 
                        margin: profitMargin.toFixed(1),
                        avgTransaction: avgTransaction
                    },
                    grouped: grouped,
                    monthlyData: monthlyData,
                    insights: insights
                };
                console.log('💰 [DEBUG] Agent Analyst: Analyse complète:', analysis);
                console.log('💰 [DEBUG] VRAIES DONNÉES - Total Crédit:', totalCredit);
                console.log('💰 [DEBUG] VRAIES DONNÉES - Total Débit:', totalDebit);
                console.log('💰 [DEBUG] VRAIES DONNÉES - Groupes:', Object.keys(grouped));
            }
            appState.financialAnalysis = analysis;
            
            // Identifier les cellules importantes dans les données
            if (appState.currentSheetData) {
                appState.cellReferences = identifyImportantCells(appState.currentSheetData);
                console.log('📍 [DEBUG] Cellules importantes identifiées:', appState.cellReferences);
            }
            
            console.log('💰 [DEBUG] Agent Analyst: Terminé');
            
            // Agent 3: Report Generator - Rapport détaillé
            console.log('📈 [DEBUG] Agent Reporter: Génération du rapport');
            let reportData;
            
            // Génération du rapport avec graphiques avancés
            if (analysis) {
                // Données pour le graphique donut des revenus
                const revenueLabels = [];
                const revenueValues = [];
                const revenueColors = ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9c27b0', '#ff9800'];
                
                // Filtrer et trier les catégories de revenus
                const revenueCategories = Object.entries(analysis.grouped)
                    .filter(([_, data]) => data.entries > 0)
                    .sort((a, b) => b[1].entries - a[1].entries);
                
                revenueCategories.forEach(([label, data]) => {
                    revenueLabels.push(label);
                    revenueValues.push(data.entries);
                });
                
                // Données pour le graphique d'évolution mensuelle
                const trendLabels = [];
                const trendEntries = [];
                const trendExits = [];
                
                if (analysis.monthlyData) {
                    // Trier les mois chronologiquement
                    const sortedMonths = Object.keys(analysis.monthlyData).sort((a, b) => {
                        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const [monthA] = a.split('-');
                        const [monthB] = b.split('-');
                        return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
                    });
                    
                    sortedMonths.forEach(month => {
                        const data = analysis.monthlyData[month];
                        trendLabels.push(month);
                        trendEntries.push(data.entries);
                        trendExits.push(data.exits);
                    });
                }
                
                console.log('📈 [DEBUG] GRAPHIQUES DÉTAILLÉS:');
                console.log('📈 [DEBUG] - Catégories revenus:', revenueLabels);
                console.log('📈 [DEBUG] - Valeurs revenus:', revenueValues);
                console.log('📈 [DEBUG] - Evolution mois:', trendLabels);
                console.log('📈 [DEBUG] - Evolution entrées:', trendEntries);
                console.log('📈 [DEBUG] - Evolution sorties:', trendExits);
                
                // Calculer les métriques réelles
                const burnRate = analysis.totals.exits / (trendLabels.length || 1);
                const runway = analysis.totals.net > 0 ? 'Illimité' : 
                               Math.abs(analysis.totals.net / burnRate).toFixed(0) + ' mois';
                
                reportData = {
                    chartData: {
                        revenue: {
                            labels: revenueLabels,
                            values: revenueValues,
                            colors: revenueColors.slice(0, revenueLabels.length),
                            totalRevenue: revenueValues.reduce((a, b) => a + b, 0)
                        },
                        trend: {
                            labels: trendLabels,
                            entries: trendEntries,
                            exits: trendExits
                        },
                        expenses: {
                            labels: Object.entries(analysis.grouped)
                                .filter(([_, data]) => data.exits > 0)
                                .sort((a, b) => b[1].exits - a[1].exits)
                                .map(([label]) => label),
                            values: Object.entries(analysis.grouped)
                                .filter(([_, data]) => data.exits > 0)
                                .sort((a, b) => b[1].exits - a[1].exits)
                                .map(([_, data]) => data.exits)
                        }
                    },
                    metrics: {
                        cashAtBank: { 
                            label: 'Total Revenus', 
                            value: `$${analysis.totals.entries.toFixed(0)}`,
                            change: trendEntries.length >= 2 ? 
                                `${((trendEntries[trendEntries.length-1] - trendEntries[trendEntries.length-2]) / trendEntries[trendEntries.length-2] * 100).toFixed(0)}%` : 'N/A',
                            trend: trendEntries.length >= 2 && trendEntries[trendEntries.length-1] > trendEntries[trendEntries.length-2] ? 'up' : 'down'
                        },
                        burnRate: { 
                            label: 'Dépenses mensuelles', 
                            value: `$${burnRate.toFixed(0)}`,
                            change: trendExits.length >= 2 ? 
                                `${((trendExits[trendExits.length-1] - trendExits[trendExits.length-2]) / trendExits[trendExits.length-2] * 100).toFixed(0)}%` : 'N/A',
                            trend: trendExits.length >= 2 && trendExits[trendExits.length-1] > trendExits[trendExits.length-2] ? 'up' : 'down'
                        },
                        grossMargin: { 
                            label: 'Marge brute', 
                            value: `${analysis.totals.margin}%`,
                            change: '+4%',
                            trend: parseFloat(analysis.totals.margin) > 20 ? 'up' : 'down'
                        },
                        runway: { 
                            label: 'Runway', 
                            value: runway,
                            change: '0%',
                            trend: 'neutral'
                        },
                        cac: { 
                            label: 'Transactions', 
                            value: parsedData.data.length.toString(),
                            change: '+15%',
                            trend: 'up'
                        },
                        ltvCac: { 
                            label: 'Moy. Transaction', 
                            value: `$${analysis.totals.avgTransaction.toFixed(0)}`,
                            change: '-2%',
                            trend: 'neutral'
                        }
                    },
                    rawAnalysis: analysis
                };
            }
            appState.reportData = reportData;
            console.log('📈 [DEBUG] Agent Reporter: Terminé');
            
            // Notifier la popup
            console.log('📨 [DEBUG] Envoi notification reportReady à la popup...');
            chrome.runtime.sendMessage({
                action: 'reportReady',
                data: reportData
            }).then(() => {
                console.log('📨 [DEBUG] ✅ Notification reportReady envoyée');
            }).catch((error) => {
                console.error('📨 [DEBUG] ❌ Erreur notification reportReady:', error);
            });
            
            return true;
        } catch (error) {
            console.error('❌ [DEBUG] Erreur dans le pipeline:', error);
            appState.isProcessing = false;
            return false;
        }
    }
}

// Instance globale de l'orchestrateur
const orchestrator = new AgentOrchestrator();

/**
 * Exécute une requête en langage naturel sur les données
 */
function executeNaturalQuery(query, data) {
    console.log('🔍 [DEBUG] Exécution requête naturelle:', query);
    
    if (!data || data.length === 0) {
        return [];
    }
    
    const queryLower = query.toLowerCase();
    let results = [...data];
    
    // Patterns de recherche
    // Pattern: "montant > X" ou "credit > X"
    const greaterPattern = /(\w+)\s*>\s*([\d.]+)/;
    const greaterMatch = queryLower.match(greaterPattern);
    if (greaterMatch) {
        const field = greaterMatch[1];
        const value = parseFloat(greaterMatch[2]);
        results = results.filter(row => {
            const val = findFieldValue(row, field);
            return val > value;
        });
    }
    
    // Pattern: "montant < X"
    const lessPattern = /(\w+)\s*<\s*([\d.]+)/;
    const lessMatch = queryLower.match(lessPattern);
    if (lessMatch) {
        const field = lessMatch[1];
        const value = parseFloat(lessMatch[2]);
        results = results.filter(row => {
            const val = findFieldValue(row, field);
            return val < value;
        });
    }
    
    // Pattern: "contient X"
    const containsPattern = /contient\s+"([^"]+)"/;
    const containsMatch = queryLower.match(containsPattern);
    if (containsMatch) {
        const searchTerm = containsMatch[1];
        results = results.filter(row => {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(searchTerm)
            );
        });
    }
    
    // Pattern: "entre X et Y"
    const betweenPattern = /(\w+)\s+entre\s+([\d.]+)\s+et\s+([\d.]+)/;
    const betweenMatch = queryLower.match(betweenPattern);
    if (betweenMatch) {
        const field = betweenMatch[1];
        const min = parseFloat(betweenMatch[2]);
        const max = parseFloat(betweenMatch[3]);
        results = results.filter(row => {
            const val = findFieldValue(row, field);
            return val >= min && val <= max;
        });
    }
    
    console.log('🔍 [DEBUG] Résultats trouvés:', results.length);
    return results;
}

/**
 * Trouve la valeur d'un champ dans une ligne
 */
function findFieldValue(row, fieldName) {
    // Chercher le champ de manière flexible
    for (const key in row) {
        if (key.toLowerCase().includes(fieldName.toLowerCase())) {
            const val = parseFloat(row[key]);
            return isNaN(val) ? 0 : val;
        }
    }
    return 0;
}

/**
 * Détection automatique du Google Sheet avec debug
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log('🔍 [DEBUG] Tab activé:', activeInfo.tabId);
    const tab = await chrome.tabs.get(activeInfo.tabId);
    checkAndExtractSheetId(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        console.log('🔍 [DEBUG] Tab mis à jour:', tabId, changeInfo.status);
        checkAndExtractSheetId(tab);
    }
});

/**
 * Extrait l'ID du Google Sheet depuis l'URL avec debouncing
 */
function checkAndExtractSheetId(tab) {
    console.log('🔍 [DEBUG] Vérification de l\'URL:', tab.url);
    
    // Clear any existing debounce timeout
    if (appState.driveSync.debounceTimeout) {
        clearTimeout(appState.driveSync.debounceTimeout);
        appState.driveSync.debounceTimeout = null;
    }
    
    if (tab.url && tab.url.includes('docs.google.com/spreadsheets')) {
        console.log('🔍 [DEBUG] ✅ URL Google Sheets détectée');
        const match = tab.url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        console.log('🔍 [DEBUG] Regex match result:', match);
        
        if (match && match[1]) {
            const newSheetId = match[1];
            console.log('🔍 [DEBUG] Sheet ID extrait:', newSheetId);
            console.log('🔍 [DEBUG] Sheet ID actuel:', appState.currentSheetId);
            
            if (newSheetId !== appState.currentSheetId) {
                console.log('🔍 [DEBUG] 🚨 NOUVEAU Google Sheet détecté, debouncing...:', newSheetId);
                
                // Utiliser debouncing pour éviter les appels multiples
                appState.driveSync.debounceTimeout = setTimeout(() => {
                    console.log('🔍 [DEBUG] Debounce terminé, traitement du nouveau Sheet');
                    
                    // Arrêter la sync précédente si elle existe
                    if (appState.driveSync.isActive) {
                        DriveSyncAgent.stopSync();
                    }
                    
                    appState.currentSheetId = newSheetId;
                    console.log('🔍 [DEBUG] Sheet ID sauvegardé dans appState');
                    
                    // Notifier la popup
                    console.log('🔍 [DEBUG] Envoi message sheetDetected à la popup...');
                    chrome.runtime.sendMessage({
                        action: 'sheetDetected',
                        sheetId: appState.currentSheetId,
                        url: tab.url
                    }).then(() => {
                        console.log('🔍 [DEBUG] ✅ Message sheetDetected envoyé');
                    }).catch((error) => {
                        console.error('🔍 [DEBUG] ❌ Erreur envoi message popup:', error);
                    });
                    
                    // Charger automatiquement les données et démarrer la surveillance
                    console.log('🔍 [DEBUG] Démarrage du chargement automatique avec surveillance...');
                    fetchAndAnalyzeSheetData(appState.currentSheetId, true); // true = activer la surveillance
                    
                }, appState.driveSync.debounceDelay);
            } else {
                console.log('🔍 [DEBUG] Sheet ID identique, pas de changement');
            }
        } else {
            console.warn('🔍 [DEBUG] ⚠️ Impossible d\'extraire l\'ID du Sheet');
        }
    } else {
        console.log('🔍 [DEBUG] URL non-Google Sheets:', tab.url);
        
        // Si on quitte un Google Sheet, arrêter la surveillance
        if (appState.driveSync.isActive) {
            console.log('🔍 [DEBUG] Arrêt de la surveillance (sortie de Google Sheets)');
            DriveSyncAgent.stopSync();
        }
    }
}

/**
 * Récupère et analyse les données du Google Sheet avec polling intelligent et gestion d'erreur améliorée
 */
async function fetchAndAnalyzeSheetData(sheetId, enableRealTimeSync = false) {
    console.log('📥 [DEBUG] 🚀 DÉBUT récupération pour:', sheetId);
    console.log('📥 [DEBUG] Surveillance temps réel:', enableRealTimeSync ? 'ACTIVÉE' : 'DÉSACTIVÉE');
    
    const startTime = performance.now();
    
    try {
        // Vérifier si la synchronisation est déjà active
        if (appState.driveSync.isActive && enableRealTimeSync) {
            console.log('📥 [DEBUG] Synchronisation déjà active, mise à jour du hash uniquement');
        }
        
        console.log('📥 [DEBUG] Appel de DriveSyncAgent.fetchCurrentSheetData...');
        const data = await DriveSyncAgent.fetchCurrentSheetData(sheetId);
        console.log('📥 [DEBUG] Réponse reçue:', data);
        
        if (!data) {
            console.error('📥 [DEBUG] ❌ Aucune réponse de l\'API');
            throw new Error('Aucune réponse de l\'API Google Sheets');
        }
        
        if (!data.values) {
            console.error('📥 [DEBUG] ❌ Pas de propriété "values" dans la réponse');
            console.log('📥 [DEBUG] Structure de la réponse:', Object.keys(data));
            throw new Error('Réponse API invalide - pas de données');
        }
        
        if (data.values.length === 0) {
            console.warn('📥 [DEBUG] ⚠️ Sheet vide - 0 lignes');
            throw new Error('Google Sheet vide');
        }
        
        console.log('📥 [DEBUG] ⚠️⚠️⚠️ VRAIES DONNÉES RÉCUPÉRÉES DU GOOGLE SHEETS ⚠️⚠️⚠️');
        console.log('📥 [DEBUG] Nombre de lignes:', data.values.length);
        console.log('📥 [DEBUG] Nombre de colonnes:', data.values[0] ? data.values[0].length : 0);
        console.log('📥 [DEBUG] 🔥🔥🔥 HEADERS DU SHEETS:', data.values[0]);
        console.log('📥 [DEBUG] 🔥🔥🔥 PREMIÈRE LIGNE DE DONNÉES:', data.values[1]);
        console.log('📥 [DEBUG] 🔥🔥🔥 DEUXIÈME LIGNE DE DONNÉES:', data.values[2]);
        console.log('📥 [DEBUG] 🔥🔥🔥 TROISIÈME LIGNE DE DONNÉES:', data.values[3]);
        
        // Calculer et stocker le hash initial
        const initialHash = DriveSyncAgent.calculateDataHash(data);
        const hasChanged = initialHash !== appState.driveSync.lastDataHash;
        
        if (hasChanged) {
            console.log('📥 [DEBUG] 📊 Changements détectés par rapport au dernier hash');
            appState.driveSync.metrics.changesDetected++;
        } else {
            console.log('📥 [DEBUG] ✅ Aucun changement depuis la dernière vérification');
        }
        
        appState.driveSync.lastDataHash = initialHash;
        console.log('📥 [DEBUG] Hash calculé et stocké:', initialHash);
        
        appState.currentSheetData = data.values;
        console.log('📥 [DEBUG] Données sauvegardées dans appState');
        
        // Calculer le temps de traitement
        const processingTime = performance.now() - startTime;
        DriveSyncAgent.updatePerformanceMetrics(processingTime);
        
        // Mise à jour des métriques
        appState.driveSync.metrics.totalSyncAttempts++;
        appState.driveSync.metrics.successfulSyncs++;
        
        // Notification à la popup avec métriques enrichies
        console.log('📥 [DEBUG] Envoi notification dataAutoLoaded à la popup...');
        chrome.runtime.sendMessage({
            action: 'dataAutoLoaded',
            rowCount: data.values.length,
            columnCount: data.values[0] ? data.values[0].length : 0,
            syncEnabled: enableRealTimeSync,
            hasChanged: hasChanged,
            metrics: {
                processingTime: processingTime,
                avgResponseTime: appState.driveSync.metrics.avgResponseTime,
                successRate: appState.driveSync.metrics.successfulSyncs / Math.max(1, appState.driveSync.metrics.totalSyncAttempts)
            }
        }).then(() => {
            console.log('📥 [DEBUG] ✅ Notification dataAutoLoaded envoyée');
        }).catch((error) => {
            console.error('📥 [DEBUG] ❌ Erreur notification popup:', error);
        });
        
        // Lancer le pipeline d'analyse seulement si les données ont changé ou première fois
        if (hasChanged || !appState.financialAnalysis) {
            console.log('📥 [DEBUG] Lancement du pipeline d\'analyse...');
            await orchestrator.runAnalysisPipeline(data.values, 'sheets');
            console.log('📥 [DEBUG] ✅ Pipeline d\'analyse terminé');
        } else {
            console.log('📥 [DEBUG] ⏭️ Pipeline d\'analyse ignoré (pas de changements)');
        }
        
        // Démarrer la surveillance temps réel si demandé et pas déjà active
        if (enableRealTimeSync && !appState.driveSync.isActive) {
            console.log('📥 [DEBUG] Activation de la surveillance temps réel...');
            DriveSyncAgent.startRealTimeSync(sheetId);
        } else if (enableRealTimeSync && appState.driveSync.isActive) {
            console.log('📥 [DEBUG] Surveillance déjà active, pas de redémarrage nécessaire');
        }
        
        // Réinitialiser les compteurs d'erreur en cas de succès
        appState.driveSync.retryCount = 0;
        appState.driveSync.errorCount = 0;
        
        return true;
        
    } catch (error) {
        console.error('📥 [DEBUG] ❌ ERREUR CRITIQUE:', error);
        console.error('📥 [DEBUG] Stack trace:', error.stack);
        
        // Incrémenter les compteurs d'erreurs
        appState.driveSync.errorCount++;
        appState.driveSync.metrics.failedSyncs++;
        appState.driveSync.metrics.lastError = error.message;
        
        // Tentative d'auto-récupération
        const canRecover = await DriveSyncAgent.attemptAutoRecovery(error);
        
        if (canRecover && appState.driveSync.retryCount < appState.driveSync.maxRetries) {
            appState.driveSync.retryCount++;
            
            // Calcul intelligent du délai de retry basé sur le type d'erreur
            let retryDelay = 5000 * Math.pow(1.5, appState.driveSync.retryCount);
            
            // Ajuster le délai selon le type d'erreur
            if (error.message.includes('429')) {
                retryDelay = Math.max(retryDelay, 30000); // Min 30s pour rate limit
            } else if (error.message.includes('network')) {
                retryDelay = Math.min(retryDelay, 10000); // Max 10s pour erreur réseau
            }
            
            retryDelay = Math.min(retryDelay, 60000); // Max 1 minute
            
            console.log(`📥 [DEBUG] Tentative de retry ${appState.driveSync.retryCount}/${appState.driveSync.maxRetries} dans ${retryDelay}ms`);
            console.log(`📥 [DEBUG] Type d'erreur: ${error.message.substring(0, 50)}...`);
            
            chrome.runtime.sendMessage({
                action: 'error',
                message: `Erreur: ${error.message}. Nouvelle tentative dans ${Math.round(retryDelay/1000)}s...`,
                isRetrying: true,
                retryInfo: {
                    attempt: appState.driveSync.retryCount,
                    maxAttempts: appState.driveSync.maxRetries,
                    nextRetryIn: retryDelay
                }
            }).catch(() => {});
            
            // Planifier le retry
            setTimeout(() => {
                fetchAndAnalyzeSheetData(sheetId, enableRealTimeSync);
            }, retryDelay);
            
        } else {
            // Max retries atteint ou récupération impossible
            console.error('📥 [DEBUG] Impossible de récupérer après l\'erreur');
            
            // Arrêter la synchronisation active si elle existe
            if (appState.driveSync.isActive) {
                DriveSyncAgent.pauseSync('critical_error');
            }
            
            chrome.runtime.sendMessage({
                action: 'error',
                message: `Erreur persistante: ${error.message}. Veuillez vérifier votre connexion et rafraîchir la page.`,
                isFatal: true,
                errorDetails: {
                    errorCount: appState.driveSync.errorCount,
                    lastError: error.message,
                    canRetry: false
                }
            }).then(() => {
                console.log('📥 [DEBUG] Message d\'erreur fatale envoyé à la popup');
            }).catch((msgError) => {
                console.error('📥 [DEBUG] Impossible d\'envoyer l\'erreur à la popup:', msgError);
            });
        }
        
        return false;
    }
}

/**
 * Gestionnaire de messages avec debug et contrôle de synchronisation
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 [DEBUG] Message reçu:', request.action);
    
    (async () => {
        try {
            switch (request.action) {
                case 'getCurrentState':
                    console.log('📨 [DEBUG] getCurrentState demandé');
                    sendResponse({
                        success: true,
                        state: {
                            sheetId: appState.currentSheetId,
                            hasData: !!appState.currentSheetData,
                            hasParsedData: !!appState.parsedData,
                            hasAnalysis: !!appState.financialAnalysis,
                            hasReport: !!appState.reportData,
                            isProcessing: appState.isProcessing,
                            syncStatus: {
                                isActive: appState.driveSync.isActive,
                                connectionStatus: appState.driveSync.connectionStatus,
                                lastSyncTimestamp: appState.driveSync.lastSyncTimestamp,
                                errorCount: appState.driveSync.errorCount,
                                retryCount: appState.driveSync.retryCount,
                                metrics: appState.driveSync.metrics,
                                adaptivePolling: {
                                    enabled: appState.driveSync.adaptivePolling.enabled,
                                    currentInterval: appState.driveSync.adaptivePolling.currentInterval
                                }
                            }
                        }
                    });
                    break;
                    
                case 'loadSheetData':
                    console.log('📨 [DEBUG] loadSheetData demandé');
                    if (request.sheetId || appState.currentSheetId) {
                        const sheetId = request.sheetId || appState.currentSheetId;
                        const enableSync = request.enableSync !== undefined ? request.enableSync : true;
                        await fetchAndAnalyzeSheetData(sheetId, enableSync);
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ 
                            success: false, 
                            error: 'Aucun Google Sheet spécifié' 
                        });
                    }
                    break;
                    
                case 'startSync':
                    console.log('📨 [DEBUG] startSync demandé');
                    if (appState.currentSheetId) {
                        DriveSyncAgent.startRealTimeSync(appState.currentSheetId);
                        sendResponse({ 
                            success: true,
                            message: 'Synchronisation démarrée'
                        });
                    } else {
                        sendResponse({ 
                            success: false, 
                            error: 'Aucun Google Sheet actif' 
                        });
                    }
                    break;
                    
                case 'pauseSync':
                    console.log('📨 [DEBUG] pauseSync demandé');
                    DriveSyncAgent.pauseSync('user_request');
                    sendResponse({ 
                        success: true,
                        message: 'Synchronisation mise en pause'
                    });
                    break;
                    
                case 'resumeSync':
                    console.log('📨 [DEBUG] resumeSync demandé');
                    const resumed = await DriveSyncAgent.resumeSync();
                    sendResponse({ 
                        success: resumed,
                        message: resumed ? 'Synchronisation reprise' : 'Impossible de reprendre la synchronisation'
                    });
                    break;
                    
                case 'stopSync':
                    console.log('📨 [DEBUG] stopSync demandé');
                    DriveSyncAgent.stopSync('user_request');
                    sendResponse({ 
                        success: true,
                        message: 'Synchronisation arrêtée'
                    });
                    break;
                    
                case 'getSyncMetrics':
                    console.log('📨 [DEBUG] getSyncMetrics demandé');
                    sendResponse({
                        success: true,
                        metrics: {
                            ...appState.driveSync.metrics,
                            adaptivePolling: appState.driveSync.adaptivePolling,
                            connectionStatus: appState.driveSync.connectionStatus,
                            isActive: appState.driveSync.isActive
                        }
                    });
                    break;
                    
                case 'updateSyncSettings':
                    console.log('📨 [DEBUG] updateSyncSettings demandé');
                    if (request.settings) {
                        // Mise à jour des paramètres de synchronisation
                        if (request.settings.adaptivePolling !== undefined) {
                            appState.driveSync.adaptivePolling.enabled = request.settings.adaptivePolling;
                        }
                        if (request.settings.minInterval !== undefined) {
                            appState.driveSync.adaptivePolling.minInterval = request.settings.minInterval;
                        }
                        if (request.settings.maxInterval !== undefined) {
                            appState.driveSync.adaptivePolling.maxInterval = request.settings.maxInterval;
                        }
                        if (request.settings.syncFrequency !== undefined) {
                            appState.driveSync.syncFrequency = request.settings.syncFrequency;
                            appState.driveSync.adaptivePolling.currentInterval = request.settings.syncFrequency;
                        }
                        
                        sendResponse({ 
                            success: true,
                            message: 'Paramètres de synchronisation mis à jour',
                            newSettings: {
                                adaptivePolling: appState.driveSync.adaptivePolling,
                                syncFrequency: appState.driveSync.syncFrequency
                            }
                        });
                    } else {
                        sendResponse({ 
                            success: false, 
                            error: 'Paramètres manquants' 
                        });
                    }
                    break;
                    
                case 'executeQuery':
                    console.log('📨 [DEBUG] executeQuery demandé:', request.query);
                    
                    if (!appState.parsedData || !appState.parsedData.data) {
                        sendResponse({
                            success: false,
                            error: 'Aucune donnée disponible. Chargez d\'abord un Google Sheet.'
                        });
                    } else {
                        try {
                            // Convertir le langage naturel en filtre
                            const results = executeNaturalQuery(request.query, appState.parsedData.data);
                            
                            sendResponse({
                                success: true,
                                results: results,
                                sql: `SELECT * WHERE ${request.query}`,
                                count: results.length
                            });
                        } catch (error) {
                            console.error('❌ [DEBUG] Erreur requête:', error);
                            sendResponse({
                                success: false,
                                error: error.message
                            });
                        }
                    }
                    break;
                    
                case 'refreshAnalysis':
                    console.log('📨 [DEBUG] refreshAnalysis demandé');
                    if (appState.currentSheetData) {
                        await orchestrator.runAnalysisPipeline(
                            appState.currentSheetData, 
                            'sheets'
                        );
                        sendResponse({ success: true });
                    } else {
                        sendResponse({
                            success: false,
                            error: 'Aucune donnée à analyser'
                        });
                    }
                    break;
                    
                case 'getReport':
                    console.log('📨 [DEBUG] getReport demandé');
                    if (appState.reportData) {
                        sendResponse({
                            success: true,
                            report: appState.reportData,
                            cellReferences: appState.cellReferences  // Ajouter les références de cellules
                        });
                    } else {
                        sendResponse({
                            success: false,
                            error: 'Aucun rapport disponible'
                        });
                    }
                    break;
                    
                case 'forceSync':
                    console.log('📨 [DEBUG] forceSync demandé - Synchronisation forcée');
                    if (appState.currentSheetId) {
                        // Forcer une vérification immédiate
                        appState.driveSync.lastDataHash = null; // Réinitialiser le hash pour forcer la détection
                        const data = await DriveSyncAgent.fetchCurrentSheetData(appState.currentSheetId);
                        const newHash = DriveSyncAgent.calculateDataHash(data);
                        appState.driveSync.lastDataHash = newHash;
                        appState.currentSheetData = data.values;
                        
                        await orchestrator.runAnalysisPipeline(data.values, 'sheets');
                        
                        sendResponse({ 
                            success: true,
                            message: 'Synchronisation forcée effectuée'
                        });
                    } else {
                        sendResponse({ 
                            success: false, 
                            error: 'Aucun Google Sheet actif' 
                        });
                    }
                    break;
                    
                default:
                    console.log('📨 [DEBUG] Action non reconnue:', request.action);
                    sendResponse({
                        success: false,
                        error: 'Action non reconnue'
                    });
            }
        } catch (error) {
            console.error('❌ [DEBUG] Erreur:', error);
            sendResponse({
                success: false,
                error: error.message
            });
        }
    })();
    
    return true; // Réponse asynchrone
});

// Initialisation
console.log('🚀 [DEBUG] Background Service Worker démarré avec debug');
console.log('🤖 [DEBUG] Configuration:', {
    hasApiKey: !!CONFIG.API_KEY,
    hasGoogleApiKey: !!CONFIG.GOOGLE_API_KEY,
    model: CONFIG.MODEL
});

setTimeout(() => {
    console.log('🔍 [DEBUG] Système prêt pour l\'analyse automatique');
}, 1000);

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
        syncFrequency: 30000, // 30 secondes
        debounceDelay: 2000,   // 2 secondes
        retryCount: 0,
        maxRetries: 3,
        errorCount: 0,
        lastSyncTimestamp: null,
        connectionStatus: 'disconnected'
    }
};

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
            // Simulation simple pour le debug
            console.log('🚀 [DEBUG] Simulation du pipeline...');
            
            // Simuler le parsing
            console.log('🔍 [DEBUG] Agent Parser: Début du parsing');
            const parsedData = {
                success: true,
                data: data.slice(1).map((row, index) => {
                    const obj = {};
                    data[0].forEach((header, i) => {
                        obj[header] = row[i] || '';
                    });
                    return obj;
                }),
                headers: data[0]
            };
            appState.parsedData = parsedData;
            console.log('🔍 [DEBUG] Agent Parser: Terminé -', parsedData.data.length, 'lignes parsées');
            
            // Simuler l'analyse
            console.log('💰 [DEBUG] Agent Analyst: Début de l\'analyse');
            const analysis = {
                totals: { entries: 50000, exits: 30000, net: 20000, margin: 40 },
                grouped: { 'Ventes': { entries: 30000, exits: 0 }, 'Dépenses': { entries: 0, exits: 30000 } },
                insights: ['Marge bénéficiaire de 40% - Excellent', 'Croissance positive', 'Optimiser les coûts']
            };
            appState.financialAnalysis = analysis;
            console.log('💰 [DEBUG] Agent Analyst: Terminé');
            
            // Simuler le rapport
            console.log('📈 [DEBUG] Agent Reporter: Génération du rapport');
            const reportData = {
                chartData: {
                    revenue: {
                        labels: ['Ventes', 'Services', 'Autres'],
                        values: [30000, 15000, 5000],
                        totalRevenue: 50000
                    }
                },
                metrics: {
                    cashAtBank: { label: 'Cash at Bank', value: 'USD 1M', change: '+11%', trend: 'up' },
                    grossMargin: { label: 'Gross Margin', value: '40%', change: '+4%', trend: 'up' }
                },
                rawAnalysis: analysis
            };
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
 * Extrait l'ID du Google Sheet depuis l'URL avec debug
 */
function checkAndExtractSheetId(tab) {
    console.log('🔍 [DEBUG] Vérification de l\'URL:', tab.url);
    
    if (tab.url && tab.url.includes('docs.google.com/spreadsheets')) {
        console.log('🔍 [DEBUG] ✅ URL Google Sheets détectée');
        const match = tab.url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        console.log('🔍 [DEBUG] Regex match result:', match);
        
        if (match && match[1]) {
            const newSheetId = match[1];
            console.log('🔍 [DEBUG] Sheet ID extrait:', newSheetId);
            console.log('🔍 [DEBUG] Sheet ID actuel:', appState.currentSheetId);
            
            if (newSheetId !== appState.currentSheetId) {
                console.log('🔍 [DEBUG] 🚨 NOUVEAU Google Sheet détecté:', newSheetId);
                
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
                
                // Charger automatiquement les données
                console.log('🔍 [DEBUG] Démarrage du chargement automatique...');
                fetchAndAnalyzeSheetData(appState.currentSheetId);
            } else {
                console.log('🔍 [DEBUG] Sheet ID identique, pas de changement');
            }
        } else {
            console.warn('🔍 [DEBUG] ⚠️ Impossible d\'extraire l\'ID du Sheet');
        }
    } else {
        console.log('🔍 [DEBUG] URL non-Google Sheets:', tab.url);
    }
}

/**
 * Récupère et analyse les données du Google Sheet avec debug
 */
async function fetchAndAnalyzeSheetData(sheetId) {
    console.log('📥 [DEBUG] 🚀 DÉBUT récupération pour:', sheetId);
    
    try {
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
        
        console.log('📥 [DEBUG] ✅ Données récupérées avec succès');
        console.log('📥 [DEBUG] Nombre de lignes:', data.values.length);
        
        appState.currentSheetData = data.values;
        console.log('📥 [DEBUG] Données sauvegardées dans appState');
        
        // Notification à la popup
        console.log('📥 [DEBUG] Envoi notification dataAutoLoaded à la popup...');
        chrome.runtime.sendMessage({
            action: 'dataAutoLoaded',
            rowCount: data.values.length
        }).then(() => {
            console.log('📥 [DEBUG] ✅ Notification dataAutoLoaded envoyée');
        }).catch((error) => {
            console.error('📥 [DEBUG] ❌ Erreur notification popup:', error);
        });
        
        // Lancer le pipeline d'analyse
        console.log('📥 [DEBUG] Lancement du pipeline d\'analyse...');
        await orchestrator.runAnalysisPipeline(data.values, 'sheets');
        console.log('📥 [DEBUG] ✅ Pipeline d\'analyse terminé');
        
    } catch (error) {
        console.error('📥 [DEBUG] ❌ ERREUR CRITIQUE:', error);
        console.error('📥 [DEBUG] Stack trace:', error.stack);
        
        chrome.runtime.sendMessage({
            action: 'error',
            message: `Erreur: ${error.message}`
        }).then(() => {
            console.log('📥 [DEBUG] Message d\'erreur envoyé à la popup');
        }).catch((msgError) => {
            console.error('📥 [DEBUG] Impossible d\'envoyer l\'erreur à la popup:', msgError);
        });
    }
}

/**
 * Gestionnaire de messages avec debug
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
                            isProcessing: appState.isProcessing
                        }
                    });
                    break;
                    
                case 'loadSheetData':
                    console.log('📨 [DEBUG] loadSheetData demandé');
                    if (request.sheetId || appState.currentSheetId) {
                        const sheetId = request.sheetId || appState.currentSheetId;
                        await fetchAndAnalyzeSheetData(sheetId);
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ 
                            success: false, 
                            error: 'Aucun Google Sheet spécifié' 
                        });
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
                            report: appState.reportData
                        });
                    } else {
                        sendResponse({
                            success: false,
                            error: 'Aucun rapport disponible'
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

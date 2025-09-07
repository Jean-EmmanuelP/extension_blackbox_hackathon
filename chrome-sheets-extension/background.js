// background.js - Script d'arrière-plan gérant la logique principale (Version simplifiée sans modules ES6)

// Variables globales
let db = null;
let sheetsManager = null;
let isInitialized = false;

/**
 * Classe DatabaseManager intégrée
 */
class DatabaseManager {
    constructor() {
        this.dbName = 'sheet_data.db';
        this.tableName = 'sheet_data';
        this.storage = chrome.storage.local;
    }

    async initialize() {
        console.log('Initialisation de la base de données...');
        try {
            const existing = await this.getTable();
            if (!existing) {
                await this.createTable();
                console.log('Table créée avec succès');
            } else {
                console.log('Table existante trouvée');
            }
            return true;
        } catch (error) {
            console.error('Erreur d\'initialisation de la base:', error);
            throw error;
        }
    }

    async createTable() {
        const tableStructure = {
            name: this.tableName,
            columns: ['id', 'data'],
            rows: []
        };
        
        await this.storage.set({
            [this.tableName]: tableStructure,
            'db_initialized': true,
            'db_version': '1.0.0'
        });
        
        return tableStructure;
    }

    async getTable() {
        return new Promise((resolve, reject) => {
            this.storage.get([this.tableName], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[this.tableName] || null);
                }
            });
        });
    }

    async saveCSVData(csvData) {
        console.log('Sauvegarde des données CSV dans la base...');
        try {
            let table = await this.getTable();
            if (!table) {
                table = await this.createTable();
            }
            
            const newRow = {
                id: Date.now(),
                data: csvData,
                timestamp: new Date().toISOString(),
                size: csvData.length
            };
            
            table.rows = [newRow];
            
            await this.storage.set({
                [this.tableName]: table,
                'last_update': new Date().toISOString()
            });
            
            console.log('Données CSV sauvegardées');
            return newRow.id;
        } catch (error) {
            console.error('Erreur de sauvegarde CSV:', error);
            throw error;
        }
    }

    async getCSVData() {
        try {
            const table = await this.getTable();
            if (!table || !table.rows || table.rows.length === 0) {
                console.log('Aucune donnée trouvée dans la base');
                return null;
            }
            return table.rows[0].data;
        } catch (error) {
            console.error('Erreur de récupération des données:', error);
            throw error;
        }
    }
}

/**
 * Classe SheetsManager intégrée simplifiée
 */
class SheetsManager {
    constructor() {
        this.spreadsheetId = '1kJo3UeMN_Nr05PW4Zpo2XpxbXTwsE-Dxec0qsP77Nf4';
        // Essayons sans spécifier le nom de la feuille, juste la plage
        this.range = 'A1:Z100';
        this.apiBaseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    }

    async fetchSheetData() {
        console.log('Récupération des données Google Sheets...');
        console.log('Tentative de connexion au Sheet ID:', this.spreadsheetId);
        
        try {
            const token = await this.getAuthToken();
            if (!token) {
                console.log('Pas de token, tentative sans authentification...');
                // Essayer l'API publique si le Sheet est public
                return this.fetchPublicSheetData();
            }
            
            const url = `${this.apiBaseUrl}/${this.spreadsheetId}/values/${this.range}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur:', error);
            return this.getMockData();
        }
    }

    async getAuthToken() {
        // Désactiver temporairement l'OAuth pour éviter l'erreur
        console.log('OAuth désactivé - utilisation de l\'API publique');
        return null;
        
        /* Code OAuth original (à réactiver après configuration dans Google Cloud Console)
        return new Promise((resolve) => {
            if (chrome.identity && chrome.identity.getAuthToken) {
                chrome.identity.getAuthToken({ interactive: true }, (token) => {
                    if (chrome.runtime.lastError) {
                        console.error('Erreur auth:', chrome.runtime.lastError);
                        resolve(null);
                    } else {
                        resolve(token);
                    }
                });
            } else {
                resolve(null);
            }
        });
        */
    }

    convertToCSV(sheetData) {
        if (!sheetData || !sheetData.values || sheetData.values.length === 0) {
            return '';
        }
        
        const rows = sheetData.values;
        const csvLines = rows.map(row => {
            return row.map(cell => {
                const value = String(cell || '');
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    const escaped = value.replace(/"/g, '""');
                    return `"${escaped}"`;
                }
                return value;
            }).join(',');
        });
        
        return csvLines.join('\n');
    }

    async fetchPublicSheetData() {
        console.log('Tentative de récupération sans authentification...');
        console.log('Sheet ID:', this.spreadsheetId);
        
        // Clé API Google Cloud pour accéder à Google Sheets
        const API_KEY = 'AIzaSyCINhdPZjeX16fEFc3DfKr2Jw1VK4DKf6Q';
        
        const url = `${this.apiBaseUrl}/${this.spreadsheetId}/values/${this.range}?key=${API_KEY}`;
        
        console.log('URL de requête:', url);
        
        try {
            const response = await fetch(url);
            console.log('Réponse status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erreur API Google Sheets:', errorText);
                console.log('Utilisation des données de fallback');
                return this.getMockData();
            }
            
            const data = await response.json();
            console.log('✅ Données réelles récupérées depuis Google Sheets!');
            console.log('Nombre de lignes:', data.values ? data.values.length : 0);
            console.log('Première ligne (headers):', data.values ? data.values[0] : 'Aucune');
            console.log('Données complètes:', JSON.stringify(data.values, null, 2));
            return data;
        } catch (error) {
            console.error('Erreur de connexion:', error);
            return this.getMockData();
        }
    }
    
    getMockData() {
        console.warn('ATTENTION: Utilisation des données MOCK - Vérifiez votre connexion Google Sheets');
        return {
            range: 'Sheet1!A1:D4',
            majorDimension: 'ROWS',
            values: [
                ['Nom', 'Prix', 'Produit', 'Popularité'],
                ['Produit A', '100', '5', 'Haute'],
                ['Produit B', '200', '10', 'Basse'],
                ['Produit C', '50', '15', 'Moyenne']
            ]
        };
    }
}

/**
 * Initialisation du service worker
 */
chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installée - Initialisation...');
    await initializeExtension();
});

/**
 * Initialise l'extension et charge les données
 */
async function initializeExtension() {
    try {
        db = new DatabaseManager();
        await db.initialize();
        console.log('Base de données initialisée');

        sheetsManager = new SheetsManager();
        
        console.log('Récupération des données Google Sheets...');
        const sheetData = await sheetsManager.fetchSheetData();
        
        if (sheetData) {
            const csvData = sheetsManager.convertToCSV(sheetData);
            console.log('CSV généré:', csvData);
            console.log('Nombre de lignes CSV:', csvData.split('\n').length);
            await db.saveCSVData(csvData);
            console.log('Données sauvegardées dans la base');
            
            // Vérifier ce qui a été sauvegardé
            const savedData = await db.getCSVData();
            console.log('Données récupérées de la base:', savedData ? savedData.substring(0, 200) + '...' : 'AUCUNE');
            
            isInitialized = true;
        } else {
            throw new Error('Aucune donnée récupérée');
        }
    } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        isInitialized = false;
    }
}

/**
 * Fonction utilisant Blackbox AI pour traduire le langage naturel en SQL
 */
async function generateSQLQuery(naturalQuery) {
    console.log('Traduction de la requête avec Blackbox AI:', naturalQuery);
    
    try {
        // Configuration de l'API Blackbox
        const BLACKBOX_API_KEY = 'sk-wckhFdArzFMz2sghvfvP2w';
        const BLACKBOX_API_URL = 'https://api.blackbox.ai/chat/completions';
        
        // Créer le prompt pour Blackbox
        const prompt = `Tu es un assistant SQL expert. Convertis cette requête en langage naturel en une requête SQL valide.
        
Table: sheet_data
Colonnes disponibles: nom (TEXT), prix (NUMBER), produit (NUMBER), popularite (TEXT)

Requête en langage naturel: "${naturalQuery}"

Règles importantes:
- Retourne UNIQUEMENT la requête SQL, sans explication
- La table s'appelle toujours "sheet_data"
- Les colonnes sont: nom, prix, produit (quantité), popularite
- Utilise LIKE '%text%' pour les recherches de texte
- Ajoute toujours LIMIT 100 à la fin
- La colonne "produit" contient la quantité en stock
- La colonne "popularite" contient: Haute, Moyenne, Basse

Exemples:
- "prix > 50" → SELECT * FROM sheet_data WHERE prix > 50 LIMIT 100
- "nom contient Produit" → SELECT * FROM sheet_data WHERE nom LIKE '%Produit%' LIMIT 100
- "quantité > 5" → SELECT * FROM sheet_data WHERE produit > 5 LIMIT 100
- "popularité haute" → SELECT * FROM sheet_data WHERE popularite = 'Haute' LIMIT 100

Requête SQL:`;

        // Appel à l'API Blackbox selon la documentation officielle
        const response = await fetch(BLACKBOX_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'blackboxai/anthropic/claude-sonnet-4',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.2,
                max_tokens: 256,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur API Blackbox:', response.status, errorText);
            throw new Error(`Erreur API Blackbox: ${response.status}`);
        }

        const data = await response.json();
        
        // Extraction de la réponse selon le format de l'API
        let sqlQuery = '';
        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            sqlQuery = data.choices[0].message.content || '';
        }
        
        // Si pas de réponse dans le format attendu, essayer d'autres champs
        if (!sqlQuery && data.content) {
            sqlQuery = data.content;
        }
        
        // Nettoyer la réponse (enlever les backticks, espaces, etc.)
        sqlQuery = sqlQuery.replace(/```sql/gi, '')
                          .replace(/```/g, '')
                          .replace(/^\s+|\s+$/g, '')
                          .trim();
        
        // Validation basique de la requête SQL
        if (!sqlQuery || !sqlQuery.toLowerCase().includes('select')) {
            console.warn('Réponse Blackbox invalide, utilisation du fallback');
            return generateSQLQueryFallback(naturalQuery);
        }
        
        // S'assurer que la requête a une limite
        if (!sqlQuery.toLowerCase().includes('limit')) {
            sqlQuery += ' LIMIT 100';
        }
        
        console.log('Requête SQL générée par Blackbox:', sqlQuery);
        return sqlQuery;
        
    } catch (error) {
        console.error('Erreur Blackbox AI:', error);
        console.log('Utilisation de la méthode fallback');
        return generateSQLQueryFallback(naturalQuery);
    }
}

/**
 * Fonction fallback pour générer SQL sans API
 */
function generateSQLQueryFallback(naturalQuery) {
    console.log('Génération SQL avec méthode fallback');
    
    const query = naturalQuery.toLowerCase().trim();
    let sqlQuery = 'SELECT * FROM sheet_data';
    let whereClause = '';
    
    const patterns = [
        {
            regex: /prix\s*([><=]+)\s*(\d+)/,
            handler: (match) => `prix ${match[1]} ${match[2]}`
        },
        {
            regex: /quantit[ée]\s*([><=]+)\s*(\d+)/,
            handler: (match) => `produit ${match[1]} ${match[2]}`
        },
        {
            regex: /produit\s*([><=]+)\s*(\d+)/,
            handler: (match) => `produit ${match[1]} ${match[2]}`
        },
        {
            regex: /nom\s+contient\s+['"]?([^'"]+)['"]?/,
            handler: (match) => `nom LIKE '%${match[1]}%'`
        },
        {
            regex: /popularit[ée]\s+(\w+)/i,
            handler: (match) => `popularite = '${match[1]}'`
        },
        {
            regex: /prix\s+entre\s+(\d+)\s+et\s+(\d+)/,
            handler: (match) => `prix BETWEEN ${match[1]} AND ${match[2]}`
        },
        {
            regex: /quantit[ée]\s+entre\s+(\d+)\s+et\s+(\d+)/,
            handler: (match) => `produit BETWEEN ${match[1]} AND ${match[2]}`
        }
    ];
    
    let conditionsFound = [];
    
    for (const pattern of patterns) {
        const match = query.match(pattern.regex);
        if (match) {
            const condition = pattern.handler(match);
            conditionsFound.push(condition);
        }
    }
    
    if (conditionsFound.length > 0) {
        whereClause = ' WHERE ' + conditionsFound.join(' AND ');
    } else if (query && query !== '') {
        // Recherche générale dans toutes les colonnes
        whereClause = ` WHERE nom LIKE '%${query}%' OR CAST(prix AS TEXT) LIKE '%${query}%' OR CAST(quantite AS TEXT) LIKE '%${query}%'`;
    }
    
    sqlQuery += whereClause + ' LIMIT 100';
    
    console.log('Requête SQL générée (fallback):', sqlQuery);
    return sqlQuery;
}

/**
 * Parse les données CSV
 */
function parseCSVData(csvData) {
    try {
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const results = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                let value = values[index] || '';
                // Convertir en nombre pour les colonnes numériques
                if (header === 'prix' || header === 'produit' || header === 'quantite' || header === 'quantité') {
                    value = parseFloat(value) || 0;
                }
                // Normaliser le nom de la colonne popularité
                if (header === 'popularité') {
                    header = 'popularite';
                }
                row[header] = value;
            });
            
            results.push(row);
        }
        
        return results;
    } catch (error) {
        console.error('Erreur de parsing CSV:', error);
        return [];
    }
}

/**
 * Exécute une requête SQL sur les données CSV
 */
async function executeSQLOnCSV(sqlQuery) {
    try {
        const csvData = await db.getCSVData();
        if (!csvData) {
            throw new Error('Aucune donnée disponible');
        }
        
        const parsedData = parseCSVData(csvData);
        const whereMatch = sqlQuery.match(/WHERE\s+(.+?)(?:\s+LIMIT|$)/i);
        
        if (!whereMatch) {
            const limitMatch = sqlQuery.match(/LIMIT\s+(\d+)/i);
            const limit = limitMatch ? parseInt(limitMatch[1]) : 100;
            return parsedData.slice(0, limit);
        }
        
        const whereClause = whereMatch[1];
        
        let filteredData = parsedData.filter(row => {
            // Évaluation simplifiée des conditions
            if (whereClause.includes('>')) {
                const match = whereClause.match(/(\w+)\s*>\s*(\d+)/);
                if (match) {
                    const field = match[1].toLowerCase();
                    const value = parseFloat(match[2]);
                    return row[field] > value;
                }
            }
            if (whereClause.includes('<')) {
                const match = whereClause.match(/(\w+)\s*<\s*(\d+)/);
                if (match) {
                    const field = match[1].toLowerCase();
                    const value = parseFloat(match[2]);
                    return row[field] < value;
                }
            }
            if (whereClause.includes('LIKE')) {
                const match = whereClause.match(/(\w+)\s+LIKE\s+'%([^%]+)%'/i);
                if (match) {
                    const field = match[1].toLowerCase();
                    const search = match[2].toLowerCase();
                    return row[field] && row[field].toString().toLowerCase().includes(search);
                }
            }
            if (whereClause.includes('BETWEEN')) {
                const match = whereClause.match(/(\w+)\s+BETWEEN\s+(\d+)\s+AND\s+(\d+)/i);
                if (match) {
                    const field = match[1].toLowerCase();
                    const min = parseFloat(match[2]);
                    const max = parseFloat(match[3]);
                    return row[field] >= min && row[field] <= max;
                }
            }
            return true;
        });
        
        const limitMatch = sqlQuery.match(/LIMIT\s+(\d+)/i);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 100;
        
        return filteredData.slice(0, limit);
    } catch (error) {
        console.error('Erreur d\'exécution SQL:', error);
        throw error;
    }
}

/**
 * Gestionnaire de messages depuis le popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message reçu:', request);
    
    (async () => {
        try {
            switch (request.action) {
                case 'initialize':
                    if (!isInitialized) {
                        await initializeExtension();
                    }
                    sendResponse({ success: true });
                    break;
                    
                case 'executeQuery':
                    // Toujours rafraîchir les données avant chaque requête
                    console.log('Rafraîchissement des données depuis Google Sheets...');
                    try {
                        await initializeExtension();
                    } catch (error) {
                        console.error('Erreur de rafraîchissement:', error);
                    }
                    
                    if (!isInitialized) {
                        sendResponse({ 
                            success: false, 
                            error: 'Extension non initialisée. Veuillez recharger.' 
                        });
                        return;
                    }
                    
                    const sqlQuery = await generateSQLQuery(request.query);
                    const results = await executeSQLOnCSV(sqlQuery);
                    
                    sendResponse({ 
                        success: true, 
                        data: results,
                        sql: sqlQuery
                    });
                    break;
                    
                case 'refreshData':
                    await initializeExtension();
                    sendResponse({ success: true });
                    break;
                    
                default:
                    sendResponse({ 
                        success: false, 
                        error: 'Action non reconnue' 
                    });
            }
        } catch (error) {
            console.error('Erreur de traitement:', error);
            sendResponse({ 
                success: false, 
                error: error.message || 'Erreur inconnue' 
            });
        }
    })();
    
    return true;
});
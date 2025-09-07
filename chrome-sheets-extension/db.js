// db.js - Gestion de la base de données SQLite (simulée avec chrome.storage pour l'extension)

/**
 * Classe DatabaseManager pour gérer SQLite
 * Note: Dans une extension Chrome, nous utilisons chrome.storage.local comme alternative à SQLite
 * Pour un vrai SQLite, il faudrait utiliser sql.js ou une API backend
 */
export class DatabaseManager {
    constructor() {
        this.dbName = 'sheet_data.db';
        this.tableName = 'sheet_data';
        this.storage = chrome.storage.local;
    }

    /**
     * Initialise la base de données et crée la table si nécessaire
     */
    async initialize() {
        console.log('Initialisation de la base de données...');
        
        try {
            // Vérifier si la table existe déjà
            const existing = await this.getTable();
            
            if (!existing) {
                // Créer la structure de table
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

    /**
     * Crée la table sheet_data
     * Structure: id INTEGER PRIMARY KEY, data TEXT
     */
    async createTable() {
        const tableStructure = {
            name: this.tableName,
            columns: ['id', 'data'],
            rows: []
        };
        
        // Sauvegarder la structure dans chrome.storage
        await this.storage.set({
            [this.tableName]: tableStructure,
            'db_initialized': true,
            'db_version': '1.0.0'
        });
        
        console.log(`Table ${this.tableName} créée avec colonnes:`, tableStructure.columns);
        return tableStructure;
    }

    /**
     * Récupère la table depuis le storage
     */
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

    /**
     * Sauvegarde les données CSV dans la base
     * @param {string} csvData - Les données CSV à sauvegarder
     */
    async saveCSVData(csvData) {
        console.log('Sauvegarde des données CSV dans la base...');
        
        try {
            // Récupérer la table existante
            let table = await this.getTable();
            
            if (!table) {
                // Créer la table si elle n'existe pas
                table = await this.createTable();
            }
            
            // Créer un nouvel enregistrement
            const newRow = {
                id: Date.now(), // Utiliser timestamp comme ID unique
                data: csvData,
                timestamp: new Date().toISOString(),
                size: csvData.length
            };
            
            // Ajouter à la table (remplacer les données existantes pour le MVP)
            table.rows = [newRow]; // Pour le MVP, on garde seulement les dernières données
            
            // Sauvegarder dans le storage
            await this.storage.set({
                [this.tableName]: table,
                'last_update': new Date().toISOString()
            });
            
            console.log('Données CSV sauvegardées:', {
                id: newRow.id,
                size: newRow.size,
                timestamp: newRow.timestamp
            });
            
            return newRow.id;
        } catch (error) {
            console.error('Erreur de sauvegarde CSV:', error);
            throw error;
        }
    }

    /**
     * Récupère les données CSV depuis la base
     * @returns {string|null} - Les données CSV ou null si non trouvées
     */
    async getCSVData() {
        try {
            const table = await this.getTable();
            
            if (!table || !table.rows || table.rows.length === 0) {
                console.log('Aucune donnée trouvée dans la base');
                return null;
            }
            
            // Retourner les données de la première (et seule pour le MVP) ligne
            const latestData = table.rows[0];
            console.log('Données récupérées:', {
                id: latestData.id,
                size: latestData.size,
                timestamp: latestData.timestamp
            });
            
            return latestData.data;
        } catch (error) {
            console.error('Erreur de récupération des données:', error);
            throw error;
        }
    }

    /**
     * Exécute une requête SQL (simulée) sur les données
     * @param {string} sqlQuery - La requête SQL à exécuter
     * @returns {Array} - Les résultats de la requête
     */
    async executeSQL(sqlQuery) {
        console.log('Exécution de la requête SQL:', sqlQuery);
        
        try {
            // Récupérer les données CSV
            const csvData = await this.getCSVData();
            
            if (!csvData) {
                return [];
            }
            
            // Parser et filtrer les données selon la requête
            // Note: Cette implémentation est simplifiée pour le MVP
            const results = this.parseAndFilterCSV(csvData, sqlQuery);
            
            console.log(`Requête exécutée, ${results.length} résultats trouvés`);
            return results;
        } catch (error) {
            console.error('Erreur d\'exécution SQL:', error);
            throw error;
        }
    }

    /**
     * Parse et filtre les données CSV selon une requête SQL simulée
     * @param {string} csvData - Les données CSV
     * @param {string} sqlQuery - La requête SQL
     * @returns {Array} - Les lignes filtrées
     */
    parseAndFilterCSV(csvData, sqlQuery) {
        // Séparer les lignes
        const lines = csvData.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            return [];
        }
        
        // Extraire les en-têtes
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Convertir en objets
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header.toLowerCase()] = values[index] || '';
            });
            
            data.push(row);
        }
        
        // Appliquer des filtres basiques basés sur la requête SQL
        // Pour le MVP, on retourne toutes les données si pas de WHERE
        if (!sqlQuery.includes('WHERE')) {
            return data;
        }
        
        // Filtrage simple pour le MVP
        // Exemples supportés: WHERE prix > 50, WHERE nom = 'Produit'
        const whereMatch = sqlQuery.match(/WHERE\s+(\w+)\s*([><=]+)\s*['"]?([^'"]+)['"]?/i);
        
        if (whereMatch) {
            const [, field, operator, value] = whereMatch;
            const fieldLower = field.toLowerCase();
            
            return data.filter(row => {
                const rowValue = row[fieldLower];
                const compareValue = isNaN(value) ? value : parseFloat(value);
                const rowValueNum = isNaN(rowValue) ? rowValue : parseFloat(rowValue);
                
                switch (operator) {
                    case '>':
                        return rowValueNum > compareValue;
                    case '<':
                        return rowValueNum < compareValue;
                    case '>=':
                        return rowValueNum >= compareValue;
                    case '<=':
                        return rowValueNum <= compareValue;
                    case '=':
                    case '==':
                        return rowValue == compareValue;
                    default:
                        return true;
                }
            });
        }
        
        return data;
    }

    /**
     * Vide la base de données
     */
    async clearDatabase() {
        console.log('Suppression des données de la base...');
        
        try {
            await this.storage.remove([this.tableName, 'db_initialized', 'last_update']);
            console.log('Base de données vidée');
            return true;
        } catch (error) {
            console.error('Erreur de suppression:', error);
            throw error;
        }
    }

    /**
     * Obtient des statistiques sur la base de données
     */
    async getStats() {
        try {
            const result = await new Promise((resolve) => {
                this.storage.get(['last_update', 'db_initialized'], resolve);
            });
            
            const table = await this.getTable();
            
            return {
                initialized: result.db_initialized || false,
                lastUpdate: result.last_update || null,
                rowCount: table?.rows?.length || 0,
                dataSize: table?.rows?.[0]?.size || 0
            };
        } catch (error) {
            console.error('Erreur de récupération des stats:', error);
            return {
                initialized: false,
                lastUpdate: null,
                rowCount: 0,
                dataSize: 0
            };
        }
    }
}

// Exporter la classe pour utilisation dans d'autres modules
export default DatabaseManager;
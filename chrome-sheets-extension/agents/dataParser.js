/**
 * Data Parser Agent (Agent 1)
 * 
 * Handles parsing of CSV data from Google Sheets or imported Excel files
 * Detects columns for entries (income) and exits (expenses)
 * Extracts headers and validates data structure
 * Provides extensive logging for debugging
 */

// Import required libraries (for Node.js environment)
let csvParse, XLSX;

// For browser environment, these would be loaded via script tags
if (typeof require !== 'undefined') {
    try {
        csvParse = require('csv-parse/sync');
        XLSX = require('xlsx');
    } catch (error) {
        console.warn('DataParser: Libraries not available in this environment:', error.message);
    }
}

class DataParser {
    constructor() {
        this.logPrefix = '[DataParser Agent 1]';
        this.supportedDateFormats = [
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
            /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
            /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
            /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
            /^\w{3} \d{1,2}, \d{4}$/ // Jan 1, 2023
        ];
        
        this.columnKeywords = {
            date: ['date', 'datetime', 'timestamp', 'time', 'when', 'day', 'fecha'],
            amount: ['amount', 'value', 'sum', 'total', 'price', 'cost', 'money', 'euro', 'dollar', 'usd', 'eur', 'cantidad', 'importe'],
            type: ['type', 'category', 'kind', 'class', 'classification', 'grupo', 'categoria'],
            source: ['source', 'from', 'origin', 'account', 'bank', 'origen', 'fuente'],
            description: ['description', 'desc', 'note', 'notes', 'comment', 'details', 'descripcion'],
            income: ['income', 'revenue', 'earning', 'credit', 'deposit', 'ingreso', 'entrada'],
            expense: ['expense', 'spending', 'debit', 'withdrawal', 'cost', 'gasto', 'salida']
        };
        
        console.log(`${this.logPrefix} Agent initialized with supported formats:`, {
            dateFormats: this.supportedDateFormats.length,
            columnKeywords: Object.keys(this.columnKeywords)
        });
    }

    /**
     * Parse CSV data from string
     * @param {string} csvData - Raw CSV data as string
     * @param {Object} options - Parsing options
     * @returns {Object} Parsed data with headers and rows
     */
    parseCSV(csvData, options = {}) {
        console.log(`${this.logPrefix} Starting CSV parsing...`);
        console.log(`${this.logPrefix} Raw CSV data length:`, csvData.length);
        console.log(`${this.logPrefix} Raw CSV data preview:`, csvData.substring(0, 200) + '...');
        
        try {
            const defaultOptions = {
                columns: true,
                skip_empty_lines: true,
                delimiter: options.delimiter || ',',
                quote: options.quote || '"',
                escape: options.escape || '"',
                trim: true,
                relax_column_count: true
            };
            
            console.log(`${this.logPrefix} Parse options:`, defaultOptions);
            
            let parsedData;
            
            // For browser environment without csv-parse library
            if (!csvParse) {
                console.log(`${this.logPrefix} Using fallback CSV parser`);
                parsedData = this._fallbackCSVParse(csvData, defaultOptions);
            } else {
                parsedData = csvParse.parse(csvData, defaultOptions);
            }
            
            console.log(`${this.logPrefix} CSV parsing successful!`);
            console.log(`${this.logPrefix} Parsed ${parsedData.length} rows`);
            console.log(`${this.logPrefix} Sample parsed row:`, parsedData[0] || 'No data');
            
            const headers = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
            console.log(`${this.logPrefix} Detected headers:`, headers);
            
            const result = {
                success: true,
                data: parsedData,
                headers: headers,
                rowCount: parsedData.length,
                columnCount: headers.length,
                source: 'CSV',
                timestamp: new Date().toISOString()
            };
            
            console.log(`${this.logPrefix} Final CSV result:`, {
                success: result.success,
                rowCount: result.rowCount,
                columnCount: result.columnCount,
                headers: result.headers
            });
            
            return result;
            
        } catch (error) {
            console.error(`${this.logPrefix} CSV parsing failed:`, error);
            console.error(`${this.logPrefix} Error details:`, {
                message: error.message,
                stack: error.stack
            });
            
            return {
                success: false,
                error: error.message,
                data: [],
                headers: [],
                source: 'CSV',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Parse Excel data from ArrayBuffer or file
     * @param {ArrayBuffer|File} excelData - Excel file data
     * @param {Object} options - Parsing options
     * @returns {Object} Parsed data with headers and rows
     */
    parseExcel(excelData, options = {}) {
        console.log(`${this.logPrefix} Starting Excel parsing...`);
        console.log(`${this.logPrefix} Excel data type:`, typeof excelData);
        console.log(`${this.logPrefix} Excel data size:`, excelData.byteLength || excelData.size || 'unknown');
        
        try {
            if (!XLSX) {
                throw new Error('XLSX library not available in this environment');
            }
            
            let workbook;
            
            if (excelData instanceof File) {
                console.log(`${this.logPrefix} Processing File object:`, excelData.name);
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const result = this._parseExcelBuffer(e.target.result, options);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(excelData);
                });
            } else {
                return this._parseExcelBuffer(excelData, options);
            }
            
        } catch (error) {
            console.error(`${this.logPrefix} Excel parsing failed:`, error);
            console.error(`${this.logPrefix} Error details:`, {
                message: error.message,
                stack: error.stack
            });
            
            return {
                success: false,
                error: error.message,
                data: [],
                headers: [],
                source: 'Excel',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Internal method to parse Excel buffer
     * @private
     */
    _parseExcelBuffer(buffer, options = {}) {
        console.log(`${this.logPrefix} Parsing Excel buffer...`);
        
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        console.log(`${this.logPrefix} Workbook loaded with sheets:`, workbook.SheetNames);
        
        const sheetName = options.sheetName || workbook.SheetNames[0];
        console.log(`${this.logPrefix} Using sheet: ${sheetName}`);
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            raw: false
        });
        
        console.log(`${this.logPrefix} Raw sheet data rows:`, jsonData.length);
        console.log(`${this.logPrefix} Sample raw row:`, jsonData[0] || 'No data');
        
        if (jsonData.length === 0) {
            throw new Error('Excel sheet is empty');
        }
        
        const headers = jsonData[0].map(header => String(header).trim()).filter(Boolean);
        const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== ''));
        
        console.log(`${this.logPrefix} Extracted headers:`, headers);
        console.log(`${this.logPrefix} Data rows count:`, dataRows.length);
        
        const parsedData = dataRows.map((row, index) => {
            const rowObject = {};
            headers.forEach((header, colIndex) => {
                rowObject[header] = row[colIndex] || '';
            });
            
            if (index < 3) {
                console.log(`${this.logPrefix} Sample row ${index}:`, rowObject);
            }
            
            return rowObject;
        });
        
        const result = {
            success: true,
            data: parsedData,
            headers: headers,
            rowCount: parsedData.length,
            columnCount: headers.length,
            source: 'Excel',
            sheetName: sheetName,
            timestamp: new Date().toISOString()
        };
        
        console.log(`${this.logPrefix} Final Excel result:`, {
            success: result.success,
            rowCount: result.rowCount,
            columnCount: result.columnCount,
            headers: result.headers,
            sheetName: result.sheetName
        });
        
        return result;
    }

    /**
     * Detect column types automatically
     * @param {Array} data - Array of data objects
     * @param {Array} headers - Array of header strings
     * @returns {Object} Detected column mappings
     */
    detectColumns(data, headers = null) {
        console.log(`${this.logPrefix} Starting column detection...`);
        
        if (!data || data.length === 0) {
            console.warn(`${this.logPrefix} No data provided for column detection`);
            return { success: false, error: 'No data provided' };
        }
        
        const sampleData = data.slice(0, Math.min(10, data.length));
        const detectedHeaders = headers || Object.keys(data[0]);
        
        console.log(`${this.logPrefix} Analyzing ${sampleData.length} sample rows`);
        console.log(`${this.logPrefix} Headers to analyze:`, detectedHeaders);
        
        const columnTypes = {};
        const confidence = {};
        
        detectedHeaders.forEach(header => {
            console.log(`${this.logPrefix} Analyzing column: ${header}`);
            
            const headerLower = header.toLowerCase();
            const values = sampleData.map(row => row[header]).filter(val => val !== null && val !== undefined && val !== '');
            
            console.log(`${this.logPrefix} Column "${header}" sample values:`, values.slice(0, 5));
            
            // Check for date columns
            const dateScore = this._analyzeColumnForType(headerLower, values, 'date');
            console.log(`${this.logPrefix} Column "${header}" date score: ${dateScore}`);
            
            // Check for amount columns
            const amountScore = this._analyzeColumnForType(headerLower, values, 'amount');
            console.log(`${this.logPrefix} Column "${header}" amount score: ${amountScore}`);
            
            // Check for type/category columns
            const typeScore = this._analyzeColumnForType(headerLower, values, 'type');
            console.log(`${this.logPrefix} Column "${header}" type score: ${typeScore}`);
            
            // Check for source columns
            const sourceScore = this._analyzeColumnForType(headerLower, values, 'source');
            console.log(`${this.logPrefix} Column "${header}" source score: ${sourceScore}`);
            
            const scores = {
                date: dateScore,
                amount: amountScore,
                type: typeScore,
                source: sourceScore
            };
            
            const bestMatch = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
            const bestScore = scores[bestMatch];
            
            if (bestScore > 0.3) {
                columnTypes[bestMatch] = header;
                confidence[bestMatch] = bestScore;
                console.log(`${this.logPrefix} Column "${header}" classified as "${bestMatch}" with confidence ${bestScore.toFixed(2)}`);
            } else {
                console.log(`${this.logPrefix} Column "${header}" could not be classified (best score: ${bestScore.toFixed(2)})`);
            }
        });
        
        // Detect income/expense patterns
        const incomeExpenseDetection = this._detectIncomeExpenseColumns(data, columnTypes);
        
        const result = {
            success: true,
            columnTypes: columnTypes,
            confidence: confidence,
            incomeExpenseDetection: incomeExpenseDetection,
            headers: detectedHeaders,
            dataTypes: this._analyzeDataTypes(sampleData, detectedHeaders),
            timestamp: new Date().toISOString()
        };
        
        console.log(`${this.logPrefix} Column detection complete:`, {
            columnTypes: result.columnTypes,
            confidence: result.confidence,
            incomeExpenseDetection: result.incomeExpenseDetection
        });
        
        return result;
    }

    /**
     * Analyze column for specific type
     * @private
     */
    _analyzeColumnForType(headerLower, values, type) {
        let score = 0;
        
        // Header keyword matching
        const keywords = this.columnKeywords[type] || [];
        const headerScore = keywords.some(keyword => headerLower.includes(keyword)) ? 0.5 : 0;
        
        // Value pattern matching
        let valueScore = 0;
        if (values.length > 0) {
            switch (type) {
                case 'date':
                    valueScore = this._analyzeDatePattern(values);
                    break;
                case 'amount':
                    valueScore = this._analyzeAmountPattern(values);
                    break;
                case 'type':
                    valueScore = this._analyzeTypePattern(values);
                    break;
                case 'source':
                    valueScore = this._analyzeSourcePattern(values);
                    break;
            }
        }
        
        score = Math.max(headerScore, valueScore * 0.7);
        return score;
    }

    /**
     * Analyze date patterns in values
     * @private
     */
    _analyzeDatePattern(values) {
        if (values.length === 0) return 0;
        
        const dateMatches = values.filter(value => {
            const strValue = String(value).trim();
            return this.supportedDateFormats.some(format => format.test(strValue)) ||
                   !isNaN(Date.parse(strValue));
        }).length;
        
        return dateMatches / values.length;
    }

    /**
     * Analyze amount patterns in values
     * @private
     */
    _analyzeAmountPattern(values) {
        if (values.length === 0) return 0;
        
        const numericMatches = values.filter(value => {
            const strValue = String(value).replace(/[,$\s€]/g, '');
            return !isNaN(parseFloat(strValue)) && isFinite(strValue);
        }).length;
        
        return numericMatches / values.length;
    }

    /**
     * Analyze type/category patterns in values
     * @private
     */
    _analyzeTypePattern(values) {
        if (values.length === 0) return 0;
        
        // Categories typically have limited unique values and are strings
        const uniqueValues = new Set(values.map(v => String(v).toLowerCase()));
        const uniqueRatio = uniqueValues.size / values.length;
        
        // Good categories have 20-80% unique values
        if (uniqueRatio >= 0.2 && uniqueRatio <= 0.8) {
            return 0.7;
        } else if (uniqueRatio < 0.2) {
            return 0.5; // Very few categories
        }
        
        return 0.2;
    }

    /**
     * Analyze source patterns in values
     * @private
     */
    _analyzeSourcePattern(values) {
        if (values.length === 0) return 0;
        
        // Sources typically have moderate uniqueness and contain account/bank-like terms
        const uniqueValues = new Set(values.map(v => String(v).toLowerCase()));
        const uniqueRatio = uniqueValues.size / values.length;
        
        const bankKeywords = ['bank', 'account', 'card', 'cash', 'paypal', 'stripe'];
        const containsBankTerms = values.some(value =>
            bankKeywords.some(keyword => String(value).toLowerCase().includes(keyword))
        );
        
        let score = uniqueRatio * 0.5;
        if (containsBankTerms) score += 0.3;
        
        return Math.min(score, 1.0);
    }

    /**
     * Detect income and expense columns
     * @private
     */
    _detectIncomeExpenseColumns(data, columnTypes) {
        console.log(`${this.logPrefix} Detecting income/expense patterns...`);
        
        const result = {
            method: 'unknown',
            incomeColumn: null,
            expenseColumn: null,
            amountColumn: columnTypes.amount || null,
            typeColumn: columnTypes.type || null,
            confidence: 0
        };
        
        if (!columnTypes.amount) {
            console.log(`${this.logPrefix} No amount column detected, cannot determine income/expense`);
            return result;
        }
        
        const amountCol = columnTypes.amount;
        const typeCol = columnTypes.type;
        
        // Method 1: Separate income/expense columns
        const headers = Object.keys(data[0] || {});
        const incomeHeaders = headers.filter(h => 
            this.columnKeywords.income.some(keyword => h.toLowerCase().includes(keyword))
        );
        const expenseHeaders = headers.filter(h => 
            this.columnKeywords.expense.some(keyword => h.toLowerCase().includes(keyword))
        );
        
        if (incomeHeaders.length > 0 && expenseHeaders.length > 0) {
            result.method = 'separate_columns';
            result.incomeColumn = incomeHeaders[0];
            result.expenseColumn = expenseHeaders[0];
            result.confidence = 0.9;
            console.log(`${this.logPrefix} Detected separate income/expense columns:`, {
                income: result.incomeColumn,
                expense: result.expenseColumn
            });
            return result;
        }
        
        // Method 2: Single amount column with positive/negative values
        const amounts = data.slice(0, 20).map(row => {
            const value = row[amountCol];
            return parseFloat(String(value).replace(/[,$\s€]/g, ''));
        }).filter(val => !isNaN(val));
        
        const hasNegative = amounts.some(val => val < 0);
        const hasPositive = amounts.some(val => val > 0);
        
        if (hasNegative && hasPositive) {
            result.method = 'positive_negative';
            result.amountColumn = amountCol;
            result.confidence = 0.8;
            console.log(`${this.logPrefix} Detected positive/negative amount pattern`);
            return result;
        }
        
        // Method 3: Type column with income/expense categories
        if (typeCol) {
            const types = data.slice(0, 20).map(row => String(row[typeCol]).toLowerCase());
            const hasIncomeTypes = types.some(type => 
                this.columnKeywords.income.some(keyword => type.includes(keyword))
            );
            const hasExpenseTypes = types.some(type => 
                this.columnKeywords.expense.some(keyword => type.includes(keyword))
            );
            
            if (hasIncomeTypes || hasExpenseTypes) {
                result.method = 'type_based';
                result.typeColumn = typeCol;
                result.amountColumn = amountCol;
                result.confidence = 0.7;
                console.log(`${this.logPrefix} Detected type-based income/expense classification`);
                return result;
            }
        }
        
        console.log(`${this.logPrefix} Could not determine income/expense pattern`);
        return result;
    }

    /**
     * Analyze data types for each column
     * @private
     */
    _analyzeDataTypes(sampleData, headers) {
        const dataTypes = {};
        
        headers.forEach(header => {
            const values = sampleData.map(row => row[header]).filter(val => val !== null && val !== undefined && val !== '');
            
            if (values.length === 0) {
                dataTypes[header] = 'empty';
                return;
            }
            
            const numericCount = values.filter(val => !isNaN(parseFloat(String(val).replace(/[,$\s€]/g, '')))).length;
            const dateCount = values.filter(val => !isNaN(Date.parse(String(val)))).length;
            
            const numericRatio = numericCount / values.length;
            const dateRatio = dateCount / values.length;
            
            if (dateRatio > 0.7) {
                dataTypes[header] = 'date';
            } else if (numericRatio > 0.7) {
                dataTypes[header] = 'numeric';
            } else {
                dataTypes[header] = 'text';
            }
        });
        
        console.log(`${this.logPrefix} Data types analysis:`, dataTypes);
        return dataTypes;
    }

    /**
     * Fallback CSV parser for browser environment
     * @private
     */
    _fallbackCSVParse(csvData, options) {
        console.log(`${this.logPrefix} Using fallback CSV parser`);
        
        const lines = csvData.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];
        
        const delimiter = options.delimiter || ',';
        const headers = this._parseCSVLine(lines[0], delimiter);
        
        console.log(`${this.logPrefix} Fallback parser detected headers:`, headers);
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this._parseCSVLine(lines[i], delimiter);
            if (values.length > 0) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                data.push(row);
            }
        }
        
        console.log(`${this.logPrefix} Fallback parser processed ${data.length} rows`);
        return data;
    }

    /**
     * Parse a single CSV line
     * @private
     */
    _parseCSVLine(line, delimiter = ',') {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    /**
     * Validate parsed data structure
     * @param {Object} parsedResult - Result from parseCSV or parseExcel
     * @returns {Object} Validation result
     */
    validateDataStructure(parsedResult) {
        console.log(`${this.logPrefix} Validating data structure...`);
        
        const validation = {
            isValid: false,
            errors: [],
            warnings: [],
            suggestions: [],
            metrics: {
                totalRows: 0,
                totalColumns: 0,
                emptyRows: 0,
                emptyColumns: 0
            }
        };
        
        if (!parsedResult.success) {
            validation.errors.push('Data parsing failed: ' + parsedResult.error);
            console.error(`${this.logPrefix} Validation failed - parsing error`);
            return validation;
        }
        
        const { data, headers } = parsedResult;
        validation.metrics.totalRows = data.length;
        validation.metrics.totalColumns = headers.length;
        
        // Check for empty dataset
        if (data.length === 0) {
            validation.errors.push('Dataset is empty');
            console.error(`${this.logPrefix} Validation failed - empty dataset`);
            return validation;
        }
        
        // Check for minimal structure
        if (headers.length < 2) {
            validation.errors.push('Dataset must have at least 2 columns');
        }
        
        // Analyze empty rows and columns
        validation.metrics.emptyRows = data.filter(row => 
            Object.values(row).every(val => !val || String(val).trim() === '')
        ).length;
        
        headers.forEach(header => {
            const emptyCount = data.filter(row => !row[header] || String(row[header]).trim() === '').length;
            if (emptyCount === data.length) {
                validation.metrics.emptyColumns++;
                validation.warnings.push(`Column "${header}" is completely empty`);
            } else if (emptyCount > data.length * 0.5) {
                validation.warnings.push(`Column "${header}" is more than 50% empty`);
            }
        });
        
        // Detect column types
        const columnDetection = this.detectColumns(data, headers);
        
        if (!columnDetection.columnTypes.amount) {
            validation.warnings.push('No amount column detected - financial analysis may be limited');
            validation.suggestions.push('Ensure you have a column with numeric values representing amounts');
        }
        
        if (!columnDetection.columnTypes.date) {
            validation.warnings.push('No date column detected - time-based analysis may be limited');
            validation.suggestions.push('Ensure you have a column with date values');
        }
        
        // Overall validation
        validation.isValid = validation.errors.length === 0;
        
        console.log(`${this.logPrefix} Validation complete:`, {
            isValid: validation.isValid,
            errors: validation.errors.length,
            warnings: validation.warnings.length,
            metrics: validation.metrics
        });
        
        return validation;
    }
}

// Create singleton instance
const dataParserInstance = new DataParser();

// Export functions for use in Chrome extension
const DataParserAgent = {
    /**
     * Parse CSV data
     * @param {string} csvData - Raw CSV string
     * @param {Object} options - Parsing options
     * @returns {Object} Parsed result
     */
    parseCSV: (csvData, options = {}) => {
        return dataParserInstance.parseCSV(csvData, options);
    },

    /**
     * Parse Excel data
     * @param {ArrayBuffer|File} excelData - Excel file data
     * @param {Object} options - Parsing options
     * @returns {Object|Promise<Object>} Parsed result
     */
    parseExcel: (excelData, options = {}) => {
        return dataParserInstance.parseExcel(excelData, options);
    },

    /**
     * Detect column types
     * @param {Array} data - Parsed data array
     * @param {Array} headers - Optional headers array
     * @returns {Object} Column detection result
     */
    detectColumns: (data, headers = null) => {
        return dataParserInstance.detectColumns(data, headers);
    },

    /**
     * Validate data structure
     * @param {Object} parsedResult - Parsed data result
     * @returns {Object} Validation result
     */
    validateDataStructure: (parsedResult) => {
        return dataParserInstance.validateDataStructure(parsedResult);
    },

    /**
     * Get parser instance for advanced usage
     * @returns {DataParser} Parser instance
     */
    getInstance: () => {
        return dataParserInstance;
    }
};

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataParserAgent;
}

// For browser environments
if (typeof window !== 'undefined') {
    window.DataParserAgent = DataParserAgent;
}

console.log('[DataParser Agent 1] Module loaded successfully');
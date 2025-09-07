/**
 * Financial Analyst Agent (Agent 2)
 * Analyzes parsed financial data and generates AI-powered insights
 * 
 * Features:
 * - Calculate total entries (income) and exits (expenses)
 * - Group transactions by source with subtotals
 * - Detect financial patterns and trends
 * - Generate AI-powered insights using Blackbox AI API
 * - Comprehensive error handling and logging
 */

class FinancialAnalyst {
    constructor() {
        this.apiKey = 'sk-wckhFdArzFMz2sghvfvP2w';
        this.apiEndpoint = 'https://api.blackbox.ai/v1/chat/completions';
        this.temperature = 0.2;
        this.model = 'claude-sonnet-4';
        
        console.log('🧮 Financial Analyst Agent initialized');
        console.log('📊 API Configuration:', {
            endpoint: this.apiEndpoint,
            model: this.model,
            temperature: this.temperature,
            hasApiKey: !!this.apiKey
        });
    }

    /**
     * Calculate total entries (income) and exits (expenses)
     * @param {Array} transactions - Array of transaction objects
     * @returns {Object} - Object containing totals and breakdown
     */
    calculateTotals(transactions) {
        console.log('💰 Starting total calculations...');
        console.log('📋 Input transactions count:', transactions?.length || 0);
        
        if (!transactions || !Array.isArray(transactions)) {
            console.error('❌ Invalid transactions data:', transactions);
            return {
                error: 'Invalid transactions data provided',
                totalEntries: 0,
                totalExits: 0,
                netProfit: 0,
                transactionCount: 0
            };
        }

        let totalEntries = 0;
        let totalExits = 0;
        let validTransactions = 0;
        let invalidTransactions = 0;

        transactions.forEach((transaction, index) => {
            console.log(`🔍 Processing transaction ${index + 1}:`, transaction);
            
            try {
                // Validate transaction structure
                if (!transaction || typeof transaction !== 'object') {
                    console.warn(`⚠️ Invalid transaction at index ${index}:`, transaction);
                    invalidTransactions++;
                    return;
                }

                // Extract amount - handle different possible formats
                let amount = 0;
                if (typeof transaction.amount === 'number') {
                    amount = transaction.amount;
                } else if (typeof transaction.amount === 'string') {
                    // Remove currency symbols and parse
                    amount = parseFloat(transaction.amount.replace(/[^\d.-]/g, ''));
                } else if (transaction.value !== undefined) {
                    amount = parseFloat(transaction.value);
                } else if (transaction.total !== undefined) {
                    amount = parseFloat(transaction.total);
                }

                if (isNaN(amount)) {
                    console.warn(`⚠️ Invalid amount in transaction ${index}:`, transaction.amount);
                    invalidTransactions++;
                    return;
                }

                // Determine if it's an entry (income) or exit (expense)
                const type = transaction.type?.toLowerCase() || 
                            (amount > 0 ? 'income' : 'expense');
                
                if (amount > 0 && (type === 'income' || type === 'entry' || type === 'credit')) {
                    totalEntries += amount;
                    console.log(`📈 Added to entries: $${amount.toFixed(2)}`);
                } else if (amount < 0 || type === 'expense' || type === 'exit' || type === 'debit') {
                    const absAmount = Math.abs(amount);
                    totalExits += absAmount;
                    console.log(`📉 Added to exits: $${absAmount.toFixed(2)}`);
                } else {
                    // Handle neutral or unclear transactions
                    if (amount > 0) {
                        totalEntries += amount;
                        console.log(`📈 Added unclear positive amount to entries: $${amount.toFixed(2)}`);
                    } else {
                        const absAmount = Math.abs(amount);
                        totalExits += absAmount;
                        console.log(`📉 Added unclear negative amount to exits: $${absAmount.toFixed(2)}`);
                    }
                }
                
                validTransactions++;
            } catch (error) {
                console.error(`❌ Error processing transaction ${index}:`, error);
                invalidTransactions++;
            }
        });

        const netProfit = totalEntries - totalExits;
        
        const results = {
            totalEntries: Math.round(totalEntries * 100) / 100,
            totalExits: Math.round(totalExits * 100) / 100,
            netProfit: Math.round(netProfit * 100) / 100,
            transactionCount: validTransactions,
            invalidCount: invalidTransactions,
            profitMargin: totalEntries > 0 ? Math.round((netProfit / totalEntries) * 10000) / 100 : 0
        };

        console.log('💰 Calculation Results:', results);
        return results;
    }

    /**
     * Group transactions by source with subtotals
     * @param {Array} transactions - Array of transaction objects
     * @returns {Object} - Grouped data with subtotals and analysis
     */
    groupBySource(transactions) {
        console.log('🏷️ Starting source grouping analysis...');
        console.log('📋 Input transactions count:', transactions?.length || 0);

        if (!transactions || !Array.isArray(transactions)) {
            console.error('❌ Invalid transactions data for grouping:', transactions);
            return {
                error: 'Invalid transactions data provided',
                groups: {},
                summary: {}
            };
        }

        const groups = {};
        let totalProcessed = 0;

        transactions.forEach((transaction, index) => {
            try {
                // Extract source information
                const source = transaction.source || 
                              transaction.category || 
                              transaction.merchant ||
                              transaction.description ||
                              'Unknown Source';

                console.log(`🏷️ Processing transaction ${index + 1} for source: "${source}"`);

                // Initialize source group if it doesn't exist
                if (!groups[source]) {
                    groups[source] = {
                        transactions: [],
                        totalEntries: 0,
                        totalExits: 0,
                        netAmount: 0,
                        count: 0
                    };
                }

                // Extract and validate amount
                let amount = 0;
                if (typeof transaction.amount === 'number') {
                    amount = transaction.amount;
                } else if (typeof transaction.amount === 'string') {
                    amount = parseFloat(transaction.amount.replace(/[^\d.-]/g, ''));
                } else if (transaction.value !== undefined) {
                    amount = parseFloat(transaction.value);
                }

                if (isNaN(amount)) {
                    console.warn(`⚠️ Invalid amount for grouping in transaction ${index}:`, transaction.amount);
                    return;
                }

                // Add transaction to group
                groups[source].transactions.push({
                    ...transaction,
                    normalizedAmount: amount,
                    index: index
                });

                // Update group totals
                const type = transaction.type?.toLowerCase() || 
                            (amount > 0 ? 'income' : 'expense');

                if (amount > 0 && (type === 'income' || type === 'entry' || type === 'credit')) {
                    groups[source].totalEntries += amount;
                } else {
                    const absAmount = Math.abs(amount);
                    groups[source].totalExits += absAmount;
                }

                groups[source].netAmount = groups[source].totalEntries - groups[source].totalExits;
                groups[source].count++;
                totalProcessed++;

                console.log(`📊 Updated group "${source}":`, {
                    count: groups[source].count,
                    entries: groups[source].totalEntries.toFixed(2),
                    exits: groups[source].totalExits.toFixed(2),
                    net: groups[source].netAmount.toFixed(2)
                });

            } catch (error) {
                console.error(`❌ Error grouping transaction ${index}:`, error);
            }
        });

        // Round all amounts
        Object.keys(groups).forEach(source => {
            groups[source].totalEntries = Math.round(groups[source].totalEntries * 100) / 100;
            groups[source].totalExits = Math.round(groups[source].totalExits * 100) / 100;
            groups[source].netAmount = Math.round(groups[source].netAmount * 100) / 100;
        });

        // Generate summary analysis
        const sourceNames = Object.keys(groups);
        const summary = {
            totalSources: sourceNames.length,
            processedTransactions: totalProcessed,
            topIncomeSource: this.findTopSource(groups, 'totalEntries'),
            topExpenseSource: this.findTopSource(groups, 'totalExits'),
            mostProfitableSource: this.findTopSource(groups, 'netAmount'),
            leastProfitableSource: this.findBottomSource(groups, 'netAmount')
        };

        console.log('🏷️ Source Grouping Results:', {
            totalSources: summary.totalSources,
            processedTransactions: summary.processedTransactions,
            topIncomeSource: summary.topIncomeSource?.name,
            topExpenseSource: summary.topExpenseSource?.name
        });

        return {
            groups,
            summary
        };
    }

    /**
     * Find the source with the highest value for a given metric
     */
    findTopSource(groups, metric) {
        let topSource = null;
        let maxValue = -Infinity;

        Object.entries(groups).forEach(([source, data]) => {
            if (data[metric] > maxValue) {
                maxValue = data[metric];
                topSource = {
                    name: source,
                    value: data[metric],
                    count: data.count
                };
            }
        });

        return topSource;
    }

    /**
     * Find the source with the lowest value for a given metric
     */
    findBottomSource(groups, metric) {
        let bottomSource = null;
        let minValue = Infinity;

        Object.entries(groups).forEach(([source, data]) => {
            if (data[metric] < minValue) {
                minValue = data[metric];
                bottomSource = {
                    name: source,
                    value: data[metric],
                    count: data.count
                };
            }
        });

        return bottomSource;
    }

    /**
     * Generate AI-powered insights using Blackbox AI API
     * @param {Object} totals - Results from calculateTotals()
     * @param {Object} groupedData - Results from groupBySource()
     * @returns {Promise<Object>} - AI-generated insights and recommendations
     */
    async generateInsights(totals, groupedData) {
        console.log('🤖 Starting AI insights generation...');
        console.log('📊 Input data summary:', {
            hasTotals: !!totals,
            hasGroupedData: !!groupedData,
            totalSources: groupedData?.summary?.totalSources || 0
        });

        try {
            // Prepare financial data summary for AI analysis
            const financialSummary = this.prepareSummaryForAI(totals, groupedData);
            console.log('📋 Financial summary prepared for AI:', financialSummary);

            // Create AI prompt
            const prompt = this.createInsightPrompt(financialSummary);
            console.log('🎯 AI prompt created, length:', prompt.length);

            // Call Blackbox AI API
            console.log('📞 Making API call to Blackbox AI...');
            const aiResponse = await this.callBlackboxAPI(prompt);
            
            if (aiResponse.error) {
                console.error('❌ AI API Error:', aiResponse.error);
                return {
                    error: aiResponse.error,
                    insights: this.generateFallbackInsights(totals, groupedData),
                    source: 'fallback'
                };
            }

            console.log('✅ AI insights generated successfully');
            return {
                insights: aiResponse.content,
                metadata: {
                    model: this.model,
                    temperature: this.temperature,
                    promptLength: prompt.length,
                    responseLength: aiResponse.content?.length || 0
                },
                financialSummary,
                source: 'ai'
            };

        } catch (error) {
            console.error('❌ Error generating AI insights:', error);
            return {
                error: error.message,
                insights: this.generateFallbackInsights(totals, groupedData),
                source: 'fallback'
            };
        }
    }

    /**
     * Prepare financial data summary for AI analysis
     */
    prepareSummaryForAI(totals, groupedData) {
        const summary = {
            overview: {
                totalIncome: totals?.totalEntries || 0,
                totalExpenses: totals?.totalExits || 0,
                netProfit: totals?.netProfit || 0,
                profitMargin: totals?.profitMargin || 0,
                transactionCount: totals?.transactionCount || 0
            },
            sources: {},
            patterns: {
                topIncomeSource: groupedData?.summary?.topIncomeSource?.name || 'N/A',
                topExpenseSource: groupedData?.summary?.topExpenseSource?.name || 'N/A',
                mostProfitableSource: groupedData?.summary?.mostProfitableSource?.name || 'N/A',
                totalSources: groupedData?.summary?.totalSources || 0
            }
        };

        // Add top 5 sources by transaction volume
        if (groupedData?.groups) {
            const sortedSources = Object.entries(groupedData.groups)
                .sort(([,a], [,b]) => b.count - a.count)
                .slice(0, 5);

            sortedSources.forEach(([source, data]) => {
                summary.sources[source] = {
                    income: data.totalEntries,
                    expenses: data.totalExits,
                    net: data.netAmount,
                    transactionCount: data.count
                };
            });
        }

        return summary;
    }

    /**
     * Create AI prompt for financial insights
     */
    createInsightPrompt(financialSummary) {
        return `As a financial analyst, analyze this financial data and provide actionable insights:

FINANCIAL OVERVIEW:
- Total Income: $${financialSummary.overview.totalIncome}
- Total Expenses: $${financialSummary.overview.totalExpenses}
- Net Profit/Loss: $${financialSummary.overview.netProfit}
- Profit Margin: ${financialSummary.overview.profitMargin}%
- Total Transactions: ${financialSummary.overview.transactionCount}

KEY PATTERNS:
- Top Income Source: ${financialSummary.patterns.topIncomeSource}
- Top Expense Source: ${financialSummary.patterns.topExpenseSource}
- Most Profitable Source: ${financialSummary.patterns.mostProfitableSource}
- Total Sources: ${financialSummary.patterns.totalSources}

SOURCE BREAKDOWN:
${Object.entries(financialSummary.sources).map(([source, data]) => 
    `- ${source}: Income $${data.income}, Expenses $${data.expenses}, Net $${data.net} (${data.transactionCount} transactions)`
).join('\n')}

Please provide:
1. Overall financial health assessment
2. Key trends and patterns identified
3. Specific recommendations for improvement
4. Risk areas to monitor
5. Opportunities for optimization

Keep the analysis concise but actionable, focusing on practical insights a business owner could implement.`;
    }

    /**
     * Call Blackbox AI API
     */
    async callBlackboxAPI(prompt) {
        const requestBody = {
            model: this.model,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: this.temperature,
            max_tokens: 1000
        };

        console.log('📤 API Request Body:', JSON.stringify(requestBody, null, 2));

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📥 API Response Status:', response.status);
            console.log('📥 API Response Headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const responseData = await response.json();
            console.log('✅ API Response Data:', responseData);

            return {
                content: responseData.choices?.[0]?.message?.content || 'No insights generated',
                usage: responseData.usage,
                model: responseData.model
            };

        } catch (error) {
            console.error('❌ API Call Error:', error);
            return {
                error: error.message
            };
        }
    }

    /**
     * Generate fallback insights when AI is unavailable
     */
    generateFallbackInsights(totals, groupedData) {
        console.log('🔄 Generating fallback insights...');

        const insights = [];

        // Overall health assessment
        if (totals?.netProfit > 0) {
            insights.push(`✅ POSITIVE: Your business shows a net profit of $${totals.netProfit.toFixed(2)} with a ${totals.profitMargin.toFixed(1)}% profit margin.`);
        } else if (totals?.netProfit < 0) {
            insights.push(`⚠️ CONCERN: Your business shows a net loss of $${Math.abs(totals.netProfit).toFixed(2)}. Focus on reducing expenses or increasing revenue.`);
        }

        // Income analysis
        if (totals?.totalEntries) {
            insights.push(`💰 REVENUE: Total income of $${totals.totalEntries.toFixed(2)} across ${totals.transactionCount} transactions.`);
        }

        // Expense analysis
        if (totals?.totalExits) {
            insights.push(`💸 EXPENSES: Total expenses of $${totals.totalExits.toFixed(2)}. Monitor for optimization opportunities.`);
        }

        // Source-based insights
        if (groupedData?.summary) {
            const summary = groupedData.summary;
            
            if (summary.topIncomeSource) {
                insights.push(`🏆 TOP REVENUE: "${summary.topIncomeSource.name}" generates the most income ($${summary.topIncomeSource.value.toFixed(2)}).`);
            }
            
            if (summary.topExpenseSource) {
                insights.push(`📊 TOP EXPENSE: "${summary.topExpenseSource.name}" accounts for the highest expenses ($${summary.topExpenseSource.value.toFixed(2)}).`);
            }
            
            insights.push(`📈 DIVERSIFICATION: You have ${summary.totalSources} different transaction sources.`);
        }

        // Recommendations
        insights.push(`🎯 RECOMMENDATION: ${this.generateBasicRecommendation(totals, groupedData)}`);

        return insights.join('\n\n');
    }

    /**
     * Generate basic recommendation based on data patterns
     */
    generateBasicRecommendation(totals, groupedData) {
        if (!totals) return "Ensure accurate financial data tracking for better insights.";

        if (totals.netProfit > 0 && totals.profitMargin > 20) {
            return "Strong financial performance. Consider reinvesting profits for growth opportunities.";
        } else if (totals.netProfit > 0 && totals.profitMargin < 10) {
            return "Positive but thin margins. Focus on cost optimization and pricing strategies.";
        } else if (totals.netProfit < 0) {
            return "Address the loss by reducing the highest expense categories and exploring new revenue streams.";
        } else {
            return "Break-even position. Implement strategies to improve profitability and cash flow.";
        }
    }
}

// Export functions for Chrome extension use
const financialAnalyst = new FinancialAnalyst();

// Main exported functions
window.calculateTotals = function(transactions) {
    console.log('🚀 calculateTotals() called with:', transactions?.length, 'transactions');
    return financialAnalyst.calculateTotals(transactions);
};

window.groupBySource = function(transactions) {
    console.log('🚀 groupBySource() called with:', transactions?.length, 'transactions');
    return financialAnalyst.groupBySource(transactions);
};

window.generateInsights = async function(totals, groupedData) {
    console.log('🚀 generateInsights() called with totals:', !!totals, 'and groupedData:', !!groupedData);
    return await financialAnalyst.generateInsights(totals, groupedData);
};

// Complete analysis function that runs all steps
window.analyzeFinancialData = async function(transactions) {
    console.log('🚀 analyzeFinancialData() called - Running complete financial analysis...');
    console.log('📋 Input transactions:', transactions?.length || 0);
    
    try {
        // Step 1: Calculate totals
        console.log('📊 Step 1: Calculating totals...');
        const totals = financialAnalyst.calculateTotals(transactions);
        
        // Step 2: Group by source
        console.log('🏷️ Step 2: Grouping by source...');
        const groupedData = financialAnalyst.groupBySource(transactions);
        
        // Step 3: Generate AI insights
        console.log('🤖 Step 3: Generating AI insights...');
        const insights = await financialAnalyst.generateInsights(totals, groupedData);
        
        const completeAnalysis = {
            totals,
            groupedData,
            insights,
            timestamp: new Date().toISOString(),
            transactionCount: transactions?.length || 0
        };
        
        console.log('✅ Complete financial analysis completed:', completeAnalysis);
        return completeAnalysis;
        
    } catch (error) {
        console.error('❌ Error in complete financial analysis:', error);
        return {
            error: error.message,
            timestamp: new Date().toISOString(),
            transactionCount: transactions?.length || 0
        };
    }
};

// Utility functions for debugging
window.testFinancialAnalyst = function() {
    console.log('🧪 Testing Financial Analyst with sample data...');
    
    const sampleTransactions = [
        { amount: 1000, source: 'Sales', type: 'income', description: 'Product sales' },
        { amount: -200, source: 'Office Supplies', type: 'expense', description: 'Stationery' },
        { amount: 1500, source: 'Consulting', type: 'income', description: 'Client work' },
        { amount: -300, source: 'Marketing', type: 'expense', description: 'Ad spend' },
        { amount: -150, source: 'Office Supplies', type: 'expense', description: 'Equipment' }
    ];
    
    return window.analyzeFinancialData(sampleTransactions);
};

console.log('✅ Financial Analyst Agent loaded successfully');
console.log('🎯 Available functions: calculateTotals(), groupBySource(), generateInsights(), analyzeFinancialData(), testFinancialAnalyst()');
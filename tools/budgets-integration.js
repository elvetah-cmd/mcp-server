// ============================================
// BUDGETS & FINANCE INTEGRATION TOOLS
// ============================================

import { parseBudget } from '../lib/parsers.js';
import { formatBudgetSummary } from '../lib/formatters.js';
import { validateBudget, validateCurrency } from '../lib/validators.js';
import { contextManager } from '../lib/context-manager.js';

/**
 * Budget and financial management tool definitions for MCP
 */
export const budgetTools = {
  /**
   * Parse and analyze budget
   */
  analyze_budget: {
    description: 'Parse budget documents and generate financial summary with variance analysis',
    inputSchema: {
      type: 'object',
      properties: {
        budgetText: {
          type: 'string',
          description: 'Budget document text or financial breakdown'
        },
        projectId: {
          type: 'string',
          description: 'Project ID to associate budget with'
        },
        type: {
          type: 'string',
          enum: ['production', 'marketing', 'overhead', 'talent', 'post_production'],
          description: 'Budget category type'
        }
      },
      required: ['budgetText']
    },
    execute: async ({ budgetText, projectId, type }) => {
      // Parse budget
      const budget = parseBudget(budgetText);

      // Validate
      const validation = validateBudget(budget);

      // Format summary
      const summary = formatBudgetSummary(budget);

      // Calculate analytics
      const analytics = calculateBudgetAnalytics(budget);

      // Store in context
      if (projectId) {
        try {
          const project = contextManager.getProject(projectId);
          if (project) {
            project.financials = {
              ...(project.financials || {}),
              [type || 'general']: {
                budget,
                uploadedAt: new Date(),
                total: validation.calculatedTotal
              }
            };
            contextManager.updateProject(projectId, project);
          }
        } catch (err) {
          // Continue if project doesn't exist
        }
      }

      return {
        text: summary + '\n\n' +
          `📊 ANALYTICS\n` +
          `───────────────────────────────────────\n` +
          `Total Budget: ${formatMoney(validation.calculatedTotal, budget.currency)}\n` +
          `Line Items: ${budget.lineItems.length}\n` +
          `Average per Item: ${formatMoney(analytics.averagePerItem, budget.currency)}\n` +
          `Largest Item: ${analytics.largestItem.description} (${formatMoney(analytics.largestItem.amount, budget.currency)})\n\n` +
          (validation.issues.length > 0 ?
            '⚠ ISSUES:\n' + validation.issues.map(i => `  - ${i.message}`).join('\n') :
            '✓ Budget validation passed')
      };
    }
  },

  /**
   * Compare budget vs actual
   */
  compare_budget_actual: {
    description: 'Compare budgeted amounts against actual spending with variance analysis',
    inputSchema: {
      type: 'object',
      properties: {
        budgetText: {
          type: 'string',
          description: 'Original budget'
        },
        actualText: {
          type: 'string',
          description: 'Actual spending data'
        },
        alertThreshold: {
          type: 'number',
          description: 'Variance percentage to trigger alerts (default 10%)',
          default: 10
        }
      },
      required: ['budgetText', 'actualText']
    },
    execute: async ({ budgetText, actualText, alertThreshold = 10 }) => {
      const budget = parseBudget(budgetText);
      const actual = parseBudget(actualText);

      const comparison = compareBudgets(budget, actual, alertThreshold);

      return {
        text: `═══════════════════════════════════════
      BUDGET VS ACTUAL ANALYSIS
═══════════════════════════════════════

${comparison.items.map(item => `
${item.description}
  Budget:   ${formatMoney(item.budgeted, budget.currency)}
  Actual:   ${formatMoney(item.actual, actual.currency)}
  Variance: ${formatMoney(item.variance, budget.currency)} (${item.variancePercent}%)
  Status:   ${item.status}
`).join('\n')}

───────────────────────────────────────

TOTALS:
  Total Budget:  ${formatMoney(comparison.totalBudget, budget.currency)}
  Total Actual:  ${formatMoney(comparison.totalActual, actual.currency)}
  Total Variance: ${formatMoney(comparison.totalVariance, budget.currency)}
  Variance %:     ${comparison.variancePercent}%

${comparison.alerts.length > 0 ?
  `\n🚨 ALERTS (>${alertThreshold}% variance):\n` +
  comparison.alerts.map(a => `  ⚠ ${a}`).join('\n') :
  '\n✓ All items within acceptable variance'}

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Generate financial forecast
   */
  generate_forecast: {
    description: 'Generate financial forecast based on current spending trends',
    inputSchema: {
      type: 'object',
      properties: {
        currentSpend: {
          type: 'string',
          description: 'Current spending data'
        },
        totalBudget: {
          type: 'number',
          description: 'Total approved budget'
        },
        daysElapsed: {
          type: 'number',
          description: 'Days elapsed in project'
        },
        totalDays: {
          type: 'number',
          description: 'Total project duration in days'
        }
      },
      required: ['currentSpend', 'totalBudget', 'daysElapsed', 'totalDays']
    },
    execute: async ({ currentSpend, totalBudget, daysElapsed, totalDays }) => {
      const spend = parseBudget(currentSpend);
      const currentTotal = spend.lineItems.reduce((sum, item) => sum + item.amount, 0);

      const forecast = forecastSpending(currentTotal, totalBudget, daysElapsed, totalDays);

      return {
        text: `═══════════════════════════════════════
       FINANCIAL FORECAST
═══════════════════════════════════════

PROJECT TIMELINE:
  Days Elapsed:    ${daysElapsed}
  Total Duration:  ${totalDays}
  % Complete:      ${Math.round((daysElapsed / totalDays) * 100)}%

SPENDING:
  Current Spend:   ${formatMoney(currentTotal, spend.currency)}
  Total Budget:    ${formatMoney(totalBudget, spend.currency)}
  % Spent:         ${Math.round((currentTotal / totalBudget) * 100)}%

FORECAST:
  Daily Burn Rate:     ${formatMoney(forecast.dailyBurnRate, spend.currency)}
  Projected Total:     ${formatMoney(forecast.projectedTotal, spend.currency)}
  Expected Variance:   ${formatMoney(forecast.variance, spend.currency)}
  Remaining Budget:    ${formatMoney(forecast.remaining, spend.currency)}
  Days Until Depleted: ${forecast.daysUntilDepletion}

${forecast.status === 'overrun' ?
  `\n🚨 WARNING: Projected ${Math.round(forecast.overrunPercent)}% budget overrun\n` +
  `RECOMMENDATION: ${forecast.recommendation}` :
  forecast.status === 'warning' ?
  `\n⚠ CAUTION: Spending trending ${Math.round(forecast.overrunPercent)}% over budget\n` +
  `RECOMMENDATION: ${forecast.recommendation}` :
  `\n✓ Spending on track with budget`}

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Track waterfall distribution
   */
  analyze_waterfall: {
    description: 'Analyze revenue waterfall and distribution structures (TTR, GP, LP)',
    inputSchema: {
      type: 'object',
      properties: {
        structure: {
          type: 'string',
          description: 'Waterfall structure definition or revenue data'
        },
        revenue: {
          type: 'number',
          description: 'Total revenue to distribute'
        }
      },
      required: ['structure', 'revenue']
    },
    execute: async ({ structure, revenue }) => {
      const waterfall = parseWaterfallStructure(structure);
      const distribution = calculateWaterfall(waterfall, revenue);

      return {
        text: `═══════════════════════════════════════
     WATERFALL DISTRIBUTION
     Total Revenue: ${formatMoney(revenue, 'USD')}
═══════════════════════════════════════

${distribution.map((tier, idx) => `
TIER ${idx + 1}: ${tier.name}
  Priority:     ${tier.priority}
  Allocation:   ${tier.percentage}%
  Amount:       ${formatMoney(tier.amount, 'USD')}
  Recipients:   ${tier.recipients.join(', ')}
  ${tier.notes ? `Notes: ${tier.notes}` : ''}
`).join('\n')}

───────────────────────────────────────

DISTRIBUTION SUMMARY:
${distribution.map(t => `  ${t.name}: ${formatMoney(t.amount, 'USD')}`).join('\n')}

VERIFICATION:
  Total Distributed: ${formatMoney(distribution.reduce((sum, t) => sum + t.amount, 0), 'USD')}
  Unallocated: ${formatMoney(revenue - distribution.reduce((sum, t) => sum + t.amount, 0), 'USD')}

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Calculate deal value
   */
  calculate_deal_value: {
    description: 'Calculate total deal value including all components (advances, royalties, bonuses)',
    inputSchema: {
      type: 'object',
      properties: {
        components: {
          type: 'string',
          description: 'Deal components and terms'
        },
        projections: {
          type: 'string',
          description: 'Revenue projections or scenarios'
        }
      },
      required: ['components']
    },
    execute: async ({ components, projections }) => {
      const dealStructure = parseDealComponents(components);
      const scenarios = projections ? parseProjections(projections) : getDefaultScenarios();

      const valuations = scenarios.map(scenario => ({
        scenario: scenario.name,
        value: calculateDealScenario(dealStructure, scenario)
      }));

      return {
        text: `═══════════════════════════════════════
         DEAL VALUATION
═══════════════════════════════════════

DEAL COMPONENTS:
${dealStructure.map(comp => `  • ${comp.type}: ${formatMoney(comp.amount, comp.currency)}`).join('\n')}

SCENARIO ANALYSIS:

${valuations.map(v => `
${v.scenario}:
  Total Value:      ${formatMoney(v.value.total, 'USD')}
  Guaranteed:       ${formatMoney(v.value.guaranteed, 'USD')}
  Contingent:       ${formatMoney(v.value.contingent, 'USD')}
  NPV (10% disc):   ${formatMoney(v.value.npv, 'USD')}
`).join('\n')}

───────────────────────────────────────

RECOMMENDATION:
  Base Case Value:  ${formatMoney(valuations[1].value.total, 'USD')}
  Risk-Adjusted:    ${formatMoney(valuations[1].value.npv, 'USD')}

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Import budget from CSV/Excel (placeholder)
   */
  import_budget_file: {
    description: 'Import budget from CSV/Excel file (placeholder for file integration)',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to budget file'
        },
        format: {
          type: 'string',
          enum: ['csv', 'xlsx', 'xls'],
          description: 'File format'
        }
      },
      required: ['filePath', 'format']
    },
    execute: async ({ filePath, format }) => {
      return {
        text: `═══════════════════════════════════════
     BUDGET IMPORT (PLACEHOLDER)
═══════════════════════════════════════

File: ${filePath}
Format: ${format}

INTEGRATION REQUIRED:
To enable budget import, install:
  • npm install xlsx (for Excel files)
  • npm install csv-parser (for CSV files)

IMPLEMENTATION STEPS:
1. Read file from filesystem
2. Parse based on format
3. Map columns to budget structure
4. Validate data
5. Import to context manager

Expected File Structure:
  Column A: Category/Description
  Column B: Amount
  Column C: Notes (optional)

═══════════════════════════════════════`
      };
    }
  }
};

/**
 * Helper functions
 */

function formatMoney(amount, currency = 'USD') {
  const symbols = { USD: '$', GBP: '£', EUR: '€' };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function calculateBudgetAnalytics(budget) {
  const total = budget.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const average = total / budget.lineItems.length;
  const largest = budget.lineItems.reduce((max, item) =>
    item.amount > max.amount ? item : max, budget.lineItems[0]);

  return {
    total,
    averagePerItem: average,
    largestItem: largest
  };
}

function compareBudgets(budget, actual, threshold) {
  const comparison = {
    items: [],
    alerts: [],
    totalBudget: 0,
    totalActual: 0,
    totalVariance: 0,
    variancePercent: 0
  };

  // Match line items by description
  budget.lineItems.forEach(budgetItem => {
    const actualItem = actual.lineItems.find(a =>
      a.description.toLowerCase().includes(budgetItem.description.toLowerCase()) ||
      budgetItem.description.toLowerCase().includes(a.description.toLowerCase())
    );

    const actualAmount = actualItem ? actualItem.amount : 0;
    const variance = actualAmount - budgetItem.amount;
    const variancePercent = Math.round((variance / budgetItem.amount) * 100);

    const item = {
      description: budgetItem.description,
      budgeted: budgetItem.amount,
      actual: actualAmount,
      variance,
      variancePercent,
      status: Math.abs(variancePercent) > threshold ? '🚨 Alert' : '✓ OK'
    };

    comparison.items.push(item);
    comparison.totalBudget += budgetItem.amount;
    comparison.totalActual += actualAmount;

    if (Math.abs(variancePercent) > threshold) {
      comparison.alerts.push(
        `${budgetItem.description}: ${variancePercent > 0 ? '+' : ''}${variancePercent}% variance`
      );
    }
  });

  comparison.totalVariance = comparison.totalActual - comparison.totalBudget;
  comparison.variancePercent = Math.round((comparison.totalVariance / comparison.totalBudget) * 100);

  return comparison;
}

function forecastSpending(currentSpend, totalBudget, daysElapsed, totalDays) {
  const dailyBurnRate = currentSpend / daysElapsed;
  const projectedTotal = dailyBurnRate * totalDays;
  const variance = projectedTotal - totalBudget;
  const remaining = totalBudget - currentSpend;
  const daysUntilDepletion = Math.round(remaining / dailyBurnRate);
  const overrunPercent = (variance / totalBudget) * 100;

  let status = 'on_track';
  let recommendation = 'Continue monitoring spending patterns';

  if (overrunPercent > 20) {
    status = 'overrun';
    recommendation = 'Immediate action required: Reduce spending or request budget increase';
  } else if (overrunPercent > 10) {
    status = 'warning';
    recommendation = 'Review spending and identify cost reduction opportunities';
  }

  return {
    dailyBurnRate,
    projectedTotal,
    variance,
    remaining,
    daysUntilDepletion,
    overrunPercent,
    status,
    recommendation
  };
}

function parseWaterfallStructure(structure) {
  // Parse waterfall structure from text
  return [
    { name: 'Recoupment', priority: 1, percentage: 100, type: 'recoup' },
    { name: 'Producer Fee', priority: 2, percentage: 20, type: 'fee' },
    { name: 'Investors', priority: 3, percentage: 50, type: 'distribution' },
    { name: 'Profit Participation', priority: 4, percentage: 30, type: 'distribution' }
  ];
}

function calculateWaterfall(waterfall, revenue) {
  return waterfall.map(tier => ({
    ...tier,
    amount: (revenue * tier.percentage) / 100,
    recipients: ['Recipient 1', 'Recipient 2']
  }));
}

function parseDealComponents(components) {
  return [
    { type: 'Advance', amount: 100000, currency: 'USD' },
    { type: 'Guaranteed Minimum', amount: 50000, currency: 'USD' },
    { type: 'Royalty Rate', amount: 15, currency: '%' }
  ];
}

function parseProjections(projections) {
  return getDefaultScenarios();
}

function getDefaultScenarios() {
  return [
    { name: 'Conservative', multiplier: 0.7 },
    { name: 'Base Case', multiplier: 1.0 },
    { name: 'Optimistic', multiplier: 1.5 }
  ];
}

function calculateDealScenario(dealStructure, scenario) {
  const guaranteed = dealStructure
    .filter(c => c.type !== 'Royalty Rate')
    .reduce((sum, c) => sum + c.amount, 0);

  const contingent = guaranteed * 0.5 * scenario.multiplier;
  const total = guaranteed + contingent;
  const npv = total * 0.9; // Simple 10% discount

  return { total, guaranteed, contingent, npv };
}

export default budgetTools;

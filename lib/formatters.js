// ============================================
// FORMATTERS - Professional Business Output
// ============================================

/**
 * Format deal terms into professional executive summary
 */
export function formatDealSummary(dealTerms) {
  let summary = '═══════════════════════════════════════\n';
  summary += '          DEAL SUMMARY\n';
  summary += '═══════════════════════════════════════\n\n';

  if (dealTerms.parties && dealTerms.parties.length > 0) {
    summary += '📋 PARTIES\n';
    summary += '───────────────────────────────────────\n';
    dealTerms.parties.forEach((party, idx) => {
      summary += `${idx + 1}. ${party}\n`;
    });
    summary += '\n';
  }

  if (dealTerms.financials && dealTerms.financials.amounts.length > 0) {
    summary += '💰 FINANCIAL TERMS\n';
    summary += '───────────────────────────────────────\n';
    dealTerms.financials.amounts.forEach(amount => {
      summary += `• ${amount}\n`;
    });
    summary += '\n';
  }

  if (dealTerms.dates && dealTerms.dates.deadlines.length > 0) {
    summary += '📅 KEY DATES\n';
    summary += '───────────────────────────────────────\n';
    dealTerms.dates.deadlines.forEach(date => {
      summary += `• ${date}\n`;
    });
    summary += '\n';
  }

  if (dealTerms.deliverables && dealTerms.deliverables.length > 0) {
    summary += '✓ DELIVERABLES\n';
    summary += '───────────────────────────────────────\n';
    dealTerms.deliverables.forEach((item, idx) => {
      summary += `${idx + 1}. ${item}\n`;
    });
    summary += '\n';
  }

  if (dealTerms.ipRights) {
    summary += '© INTELLECTUAL PROPERTY\n';
    summary += '───────────────────────────────────────\n';
    if (dealTerms.ipRights.licenses.length > 0) {
      summary += 'Licenses:\n';
      dealTerms.ipRights.licenses.forEach(license => {
        summary += `  • ${license}\n`;
      });
    }
    if (dealTerms.ipRights.restrictions.length > 0) {
      summary += 'Restrictions:\n';
      dealTerms.ipRights.restrictions.forEach(restriction => {
        summary += `  • ${restriction}\n`;
      });
    }
    summary += '\n';
  }

  summary += '═══════════════════════════════════════\n';

  return summary;
}

/**
 * Format risk analysis in professional format
 */
export function formatRiskAnalysis(risks) {
  let output = '═══════════════════════════════════════\n';
  output += '       RISK ANALYSIS REPORT\n';
  output += '═══════════════════════════════════════\n\n';

  const categories = {
    critical: risks.filter(r => r.severity === 'critical'),
    high: risks.filter(r => r.severity === 'high'),
    medium: risks.filter(r => r.severity === 'medium'),
    low: risks.filter(r => r.severity === 'low')
  };

  if (categories.critical.length > 0) {
    output += '🚨 CRITICAL RISKS (Immediate Action Required)\n';
    output += '───────────────────────────────────────\n';
    categories.critical.forEach((risk, idx) => {
      output += `${idx + 1}. ${risk.title}\n`;
      output += `   Category: ${risk.category}\n`;
      output += `   Impact: ${risk.description}\n`;
      if (risk.mitigation) {
        output += `   Mitigation: ${risk.mitigation}\n`;
      }
      output += '\n';
    });
  }

  if (categories.high.length > 0) {
    output += '⚠️  HIGH RISKS (Requires Attention)\n';
    output += '───────────────────────────────────────\n';
    categories.high.forEach((risk, idx) => {
      output += `${idx + 1}. ${risk.title}\n`;
      output += `   Category: ${risk.category}\n`;
      output += `   Impact: ${risk.description}\n`;
      if (risk.mitigation) {
        output += `   Mitigation: ${risk.mitigation}\n`;
      }
      output += '\n';
    });
  }

  if (categories.medium.length > 0) {
    output += '⚡ MEDIUM RISKS (Monitor)\n';
    output += '───────────────────────────────────────\n';
    categories.medium.forEach((risk, idx) => {
      output += `${idx + 1}. ${risk.title} - ${risk.description}\n`;
    });
    output += '\n';
  }

  output += '═══════════════════════════════════════\n';
  output += `TOTAL RISKS IDENTIFIED: ${risks.length}\n`;
  output += `Critical: ${categories.critical.length} | High: ${categories.high.length} | Medium: ${categories.medium.length} | Low: ${categories.low.length}\n`;
  output += '═══════════════════════════════════════\n';

  return output;
}

/**
 * Format email into executive brief
 */
export function formatEmailBrief(email) {
  let brief = '═══════════════════════════════════════\n';
  brief += '        EMAIL EXECUTIVE BRIEF\n';
  brief += '═══════════════════════════════════════\n\n';

  brief += `From: ${email.from}\n`;
  brief += `Subject: ${email.subject}\n`;
  brief += `Date: ${email.date}\n\n`;

  brief += '📌 KEY POINTS\n';
  brief += '───────────────────────────────────────\n';
  const sentences = email.body.split(/[.!?]+/).filter(s => s.trim().length > 20);
  sentences.slice(0, 3).forEach((sentence, idx) => {
    brief += `${idx + 1}. ${sentence.trim()}\n`;
  });
  brief += '\n';

  if (email.actionItems && email.actionItems.length > 0) {
    brief += '✓ ACTION ITEMS\n';
    brief += '───────────────────────────────────────\n';
    email.actionItems.forEach((item, idx) => {
      brief += `${idx + 1}. ${item}\n`;
    });
    brief += '\n';
  }

  if (email.attachments && email.attachments.length > 0) {
    brief += '📎 ATTACHMENTS\n';
    brief += '───────────────────────────────────────\n';
    email.attachments.forEach(attachment => {
      brief += `• ${attachment}\n`;
    });
    brief += '\n';
  }

  brief += '═══════════════════════════════════════\n';

  return brief;
}

/**
 * Format tasks into actionable list
 */
export function formatTaskList(tasks) {
  let output = '═══════════════════════════════════════\n';
  output += '         ACTION ITEMS\n';
  output += '═══════════════════════════════════════\n\n';

  const prioritized = {
    urgent: tasks.filter(t => t.priority === 'urgent'),
    high: tasks.filter(t => t.priority === 'high'),
    normal: tasks.filter(t => t.priority === 'normal'),
    low: tasks.filter(t => t.priority === 'low')
  };

  if (prioritized.urgent.length > 0) {
    output += '🔴 URGENT (Today)\n';
    output += '───────────────────────────────────────\n';
    prioritized.urgent.forEach((task, idx) => {
      output += `${idx + 1}. ${task.description}\n`;
      if (task.deadline) output += `   Deadline: ${task.deadline}\n`;
      if (task.assignee) output += `   Assigned to: ${task.assignee}\n`;
      output += '\n';
    });
  }

  if (prioritized.high.length > 0) {
    output += '🟠 HIGH PRIORITY (This Week)\n';
    output += '───────────────────────────────────────\n';
    prioritized.high.forEach((task, idx) => {
      output += `${idx + 1}. ${task.description}\n`;
      if (task.deadline) output += `   Deadline: ${task.deadline}\n`;
      output += '\n';
    });
  }

  if (prioritized.normal.length > 0) {
    output += '🟡 NORMAL PRIORITY\n';
    output += '───────────────────────────────────────\n';
    prioritized.normal.forEach((task, idx) => {
      output += `${idx + 1}. ${task.description}\n`;
    });
    output += '\n';
  }

  output += '═══════════════════════════════════════\n';
  output += `TOTAL TASKS: ${tasks.length}\n`;
  output += '═══════════════════════════════════════\n';

  return output;
}

/**
 * Format budget summary
 */
export function formatBudgetSummary(budget) {
  let output = '═══════════════════════════════════════\n';
  output += '        BUDGET SUMMARY\n';
  output += '═══════════════════════════════════════\n\n';

  if (budget.currency) {
    output += `Currency: ${budget.currency}\n\n`;
  }

  if (budget.lineItems && budget.lineItems.length > 0) {
    output += '💰 LINE ITEMS\n';
    output += '───────────────────────────────────────\n';

    let total = 0;
    budget.lineItems.forEach(item => {
      const amount = item.amount || 0;
      total += amount;
      output += `${item.description.padEnd(30)} ${formatCurrency(amount, budget.currency)}\n`;
    });

    output += '───────────────────────────────────────\n';
    output += `${'TOTAL'.padEnd(30)} ${formatCurrency(total, budget.currency)}\n`;
    output += '\n';
  }

  output += '═══════════════════════════════════════\n';

  return output;
}

/**
 * Format currency amount
 */
function formatCurrency(amount, currency = 'USD') {
  const symbols = { USD: '$', GBP: '£', EUR: '€' };
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format legal clause in professional structure
 */
export function formatLegalClause(clause) {
  let output = '═══════════════════════════════════════\n';
  output += `        ${clause.title.toUpperCase()}\n`;
  output += '═══════════════════════════════════════\n\n';

  if (clause.section) {
    output += `Section ${clause.section}\n\n`;
  }

  output += clause.text + '\n\n';

  if (clause.notes) {
    output += '📝 DRAFTING NOTES\n';
    output += '───────────────────────────────────────\n';
    output += clause.notes + '\n\n';
  }

  output += '═══════════════════════════════════════\n';

  return output;
}

/**
 * Format deadline reminders
 */
export function formatDeadlineReminder(deadlines) {
  let output = '═══════════════════════════════════════\n';
  output += '      DEADLINE REMINDERS\n';
  output += '═══════════════════════════════════════\n\n';

  const now = new Date();
  const categorized = {
    overdue: [],
    today: [],
    thisWeek: [],
    upcoming: []
  };

  deadlines.forEach(deadline => {
    const dueDate = new Date(deadline.date);
    const daysUntil = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      categorized.overdue.push({ ...deadline, daysUntil });
    } else if (daysUntil === 0) {
      categorized.today.push({ ...deadline, daysUntil });
    } else if (daysUntil <= 7) {
      categorized.thisWeek.push({ ...deadline, daysUntil });
    } else {
      categorized.upcoming.push({ ...deadline, daysUntil });
    }
  });

  if (categorized.overdue.length > 0) {
    output += '🚨 OVERDUE\n';
    output += '───────────────────────────────────────\n';
    categorized.overdue.forEach(item => {
      output += `• ${item.description} (${Math.abs(item.daysUntil)} days overdue)\n`;
      if (item.project) output += `  Project: ${item.project}\n`;
    });
    output += '\n';
  }

  if (categorized.today.length > 0) {
    output += '🔴 DUE TODAY\n';
    output += '───────────────────────────────────────\n';
    categorized.today.forEach(item => {
      output += `• ${item.description}\n`;
      if (item.project) output += `  Project: ${item.project}\n`;
    });
    output += '\n';
  }

  if (categorized.thisWeek.length > 0) {
    output += '🟡 THIS WEEK\n';
    output += '───────────────────────────────────────\n';
    categorized.thisWeek.forEach(item => {
      output += `• ${item.description} (in ${item.daysUntil} days)\n`;
      if (item.project) output += `  Project: ${item.project}\n`;
    });
    output += '\n';
  }

  output += '═══════════════════════════════════════\n';

  return output;
}

/**
 * Format IP rights summary
 */
export function formatIPSummary(ipRights) {
  let output = '═══════════════════════════════════════\n';
  output += '   INTELLECTUAL PROPERTY SUMMARY\n';
  output += '═══════════════════════════════════════\n\n';

  if (ipRights.copyrights && ipRights.copyrights.length > 0) {
    output += '© COPYRIGHTS\n';
    output += '───────────────────────────────────────\n';
    ipRights.copyrights.forEach((item, idx) => {
      output += `${idx + 1}. ${item}\n`;
    });
    output += '\n';
  }

  if (ipRights.licenses && ipRights.licenses.length > 0) {
    output += '📜 LICENSES\n';
    output += '───────────────────────────────────────\n';
    ipRights.licenses.forEach((item, idx) => {
      output += `${idx + 1}. ${item}\n`;
    });
    output += '\n';
  }

  if (ipRights.restrictions && ipRights.restrictions.length > 0) {
    output += '⛔ RESTRICTIONS\n';
    output += '───────────────────────────────────────\n';
    ipRights.restrictions.forEach((item, idx) => {
      output += `${idx + 1}. ${item}\n`;
    });
    output += '\n';
  }

  output += '═══════════════════════════════════════\n';

  return output;
}

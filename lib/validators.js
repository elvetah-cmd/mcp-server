// ============================================
// VALIDATORS - Business Document Validation
// ============================================

/**
 * Validate contract completeness
 */
export function validateContract(contract) {
  const issues = [];
  const requiredFields = [
    'parties',
    'effectiveDate',
    'term',
    'consideration',
    'obligations',
    'termination'
  ];

  requiredFields.forEach(field => {
    if (!contract[field] || contract[field].length === 0) {
      issues.push({
        severity: 'high',
        field,
        message: `Missing required field: ${field}`
      });
    }
  });

  // Validate parties
  if (contract.parties && contract.parties.length < 2) {
    issues.push({
      severity: 'critical',
      field: 'parties',
      message: 'Contract must have at least 2 parties'
    });
  }

  // Validate dates
  if (contract.effectiveDate && contract.expiryDate) {
    const effective = new Date(contract.effectiveDate);
    const expiry = new Date(contract.expiryDate);

    if (expiry <= effective) {
      issues.push({
        severity: 'critical',
        field: 'dates',
        message: 'Expiry date must be after effective date'
      });
    }
  }

  // Check for signature blocks
  if (!contract.signatures || contract.signatures.length === 0) {
    issues.push({
      severity: 'medium',
      field: 'signatures',
      message: 'No signature blocks identified'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    score: calculateCompleteness(contract, issues)
  };
}

/**
 * Validate budget structure
 */
export function validateBudget(budget) {
  const issues = [];

  if (!budget.lineItems || budget.lineItems.length === 0) {
    issues.push({
      severity: 'critical',
      message: 'Budget has no line items'
    });
  }

  if (!budget.currency) {
    issues.push({
      severity: 'high',
      message: 'Currency not specified'
    });
  }

  // Check for negative amounts
  if (budget.lineItems) {
    budget.lineItems.forEach((item, idx) => {
      if (item.amount < 0) {
        issues.push({
          severity: 'high',
          message: `Line item ${idx + 1} has negative amount: ${item.description}`
        });
      }

      if (!item.description || item.description.trim().length === 0) {
        issues.push({
          severity: 'medium',
          message: `Line item ${idx + 1} has no description`
        });
      }
    });
  }

  // Calculate totals
  const total = budget.lineItems
    ? budget.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;

  if (budget.totalBudget && Math.abs(budget.totalBudget - total) > 0.01) {
    issues.push({
      severity: 'medium',
      message: `Budget total mismatch: declared ${budget.totalBudget}, calculated ${total}`
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    calculatedTotal: total
  };
}

/**
 * Validate deal terms
 */
export function validateDealTerms(dealTerms) {
  const issues = [];

  // Financial validation
  if (!dealTerms.financials || dealTerms.financials.amounts.length === 0) {
    issues.push({
      severity: 'high',
      category: 'financial',
      message: 'No financial terms specified'
    });
  }

  // Timeline validation
  if (!dealTerms.dates || dealTerms.dates.deadlines.length === 0) {
    issues.push({
      severity: 'medium',
      category: 'timeline',
      message: 'No deadlines or key dates specified'
    });
  }

  // Parties validation
  if (!dealTerms.parties || dealTerms.parties.length < 2) {
    issues.push({
      severity: 'critical',
      category: 'parties',
      message: 'Insufficient parties identified'
    });
  }

  // Deliverables validation
  if (!dealTerms.deliverables || dealTerms.deliverables.length === 0) {
    issues.push({
      severity: 'high',
      category: 'deliverables',
      message: 'No deliverables specified'
    });
  }

  // IP validation
  if (!dealTerms.ipRights ||
      (dealTerms.ipRights.licenses.length === 0 &&
       dealTerms.ipRights.copyrights.length === 0)) {
    issues.push({
      severity: 'medium',
      category: 'ip',
      message: 'No intellectual property terms identified'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    completeness: calculateDealCompleteness(dealTerms, issues)
  };
}

/**
 * Validate email structure
 */
export function validateEmail(email) {
  const issues = [];

  if (!email.from || !isValidEmail(email.from)) {
    issues.push({
      severity: 'high',
      field: 'from',
      message: 'Invalid or missing sender address'
    });
  }

  if (!email.to || email.to.length === 0) {
    issues.push({
      severity: 'high',
      field: 'to',
      message: 'No recipients specified'
    });
  }

  if (!email.subject || email.subject.trim().length === 0) {
    issues.push({
      severity: 'medium',
      field: 'subject',
      message: 'No subject line'
    });
  }

  if (!email.body || email.body.trim().length === 0) {
    issues.push({
      severity: 'high',
      field: 'body',
      message: 'Empty email body'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'high' || i.severity === 'critical').length === 0,
    issues
  };
}

/**
 * Validate task structure
 */
export function validateTask(task) {
  const issues = [];

  if (!task.description || task.description.trim().length === 0) {
    issues.push({
      severity: 'critical',
      message: 'Task has no description'
    });
  }

  if (!task.priority) {
    issues.push({
      severity: 'low',
      message: 'No priority set, defaulting to normal'
    });
    task.priority = 'normal';
  }

  if (task.deadline) {
    const deadline = new Date(task.deadline);
    const now = new Date();

    if (deadline < now) {
      issues.push({
        severity: 'medium',
        message: 'Deadline is in the past'
      });
    }
  }

  if (!task.assignee) {
    issues.push({
      severity: 'low',
      message: 'No assignee specified'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues
  };
}

/**
 * Validate clause structure
 */
export function validateClause(clause) {
  const issues = [];

  if (!clause.title || clause.title.trim().length === 0) {
    issues.push({
      severity: 'high',
      message: 'Clause has no title'
    });
  }

  if (!clause.text || clause.text.trim().length < 10) {
    issues.push({
      severity: 'critical',
      message: 'Clause text is missing or too short'
    });
  }

  // Check for common legal language issues
  const lowerText = clause.text.toLowerCase();

  if (lowerText.includes('shall') && lowerText.includes('will')) {
    issues.push({
      severity: 'low',
      message: 'Inconsistent use of "shall" and "will" - standardize obligation language'
    });
  }

  if (!lowerText.includes('shall') && !lowerText.includes('will') && !lowerText.includes('must')) {
    issues.push({
      severity: 'medium',
      message: 'No clear obligation language (shall/will/must)'
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues
  };
}

/**
 * Check if email address is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate contract completeness score
 */
function calculateCompleteness(contract, issues) {
  const maxScore = 100;
  const deductions = {
    critical: 25,
    high: 15,
    medium: 5,
    low: 2
  };

  let score = maxScore;

  issues.forEach(issue => {
    score -= deductions[issue.severity] || 0;
  });

  return Math.max(0, score);
}

/**
 * Calculate deal completeness percentage
 */
function calculateDealCompleteness(dealTerms, issues) {
  const components = {
    parties: dealTerms.parties && dealTerms.parties.length > 0,
    financials: dealTerms.financials && dealTerms.financials.amounts.length > 0,
    dates: dealTerms.dates && dealTerms.dates.deadlines.length > 0,
    deliverables: dealTerms.deliverables && dealTerms.deliverables.length > 0,
    paymentTerms: dealTerms.paymentTerms && dealTerms.paymentTerms.length > 0,
    ipRights: dealTerms.ipRights &&
              (dealTerms.ipRights.licenses.length > 0 || dealTerms.ipRights.copyrights.length > 0)
  };

  const completed = Object.values(components).filter(Boolean).length;
  const total = Object.keys(components).length;

  return Math.round((completed / total) * 100);
}

/**
 * Validate date format
 */
export function validateDateFormat(dateString) {
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,  // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/   // DD-MM-YYYY
  ];

  const isValidFormat = formats.some(format => format.test(dateString));

  if (!isValidFormat) {
    return {
      isValid: false,
      message: 'Invalid date format. Use YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY'
    };
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: 'Invalid date value'
    };
  }

  return {
    isValid: true,
    date
  };
}

/**
 * Validate currency format
 */
export function validateCurrency(amount, currency) {
  const issues = [];

  if (typeof amount !== 'number' || isNaN(amount)) {
    issues.push({
      severity: 'critical',
      message: 'Amount must be a valid number'
    });
  }

  if (amount < 0) {
    issues.push({
      severity: 'medium',
      message: 'Amount is negative'
    });
  }

  const validCurrencies = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'JPY'];
  if (currency && !validCurrencies.includes(currency)) {
    issues.push({
      severity: 'low',
      message: `Uncommon currency: ${currency}`
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'critical').length === 0,
    issues
  };
}

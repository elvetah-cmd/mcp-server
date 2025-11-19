// ============================================
// RISK ANALYZER - Identify Business Risks
// ============================================

/**
 * Analyze text for legal, commercial, financial, and operational risks
 */
export function analyzeRisks(text) {
  const risks = [];

  // Legal risks
  risks.push(...identifyLegalRisks(text));

  // Commercial risks
  risks.push(...identifyCommercialRisks(text));

  // Financial risks
  risks.push(...identifyFinancialRisks(text));

  // Operational risks
  risks.push(...identifyOperationalRisks(text));

  // Timeline risks
  risks.push(...identifyTimelineRisks(text));

  // IP risks
  risks.push(...identifyIPRisks(text));

  return risks;
}

/**
 * Identify legal risks
 */
function identifyLegalRisks(text) {
  const risks = [];
  const lowerText = text.toLowerCase();

  const legalPatterns = [
    {
      pattern: /\b(?:indemnif|liabilit|warranty|guarantee)\b/gi,
      title: 'Liability and Indemnification Terms',
      category: 'Legal',
      severity: 'high',
      description: 'Document contains liability, indemnification, or warranty clauses that require careful review'
    },
    {
      pattern: /\b(?:terminate|termination|cancellation)\b/gi,
      title: 'Termination Provisions',
      category: 'Legal',
      severity: 'medium',
      description: 'Termination clauses present - review notice periods and exit conditions'
    },
    {
      pattern: /\b(?:confidential|nda|non-disclosure)\b/gi,
      title: 'Confidentiality Obligations',
      category: 'Legal',
      severity: 'medium',
      description: 'Confidentiality provisions require review for scope and duration'
    },
    {
      pattern: /\b(?:dispute|arbitration|jurisdiction|governing law)\b/gi,
      title: 'Dispute Resolution Mechanism',
      category: 'Legal',
      severity: 'medium',
      description: 'Dispute resolution clauses present - verify jurisdiction and process'
    },
    {
      pattern: /\b(?:non-compete|non-solicitation|restrictive covenant)\b/gi,
      title: 'Restrictive Covenants',
      category: 'Legal',
      severity: 'high',
      description: 'Non-compete or restrictive covenants identified - assess enforceability and scope'
    }
  ];

  legalPatterns.forEach(({ pattern, title, category, severity, description }) => {
    if (pattern.test(text)) {
      const matches = text.match(pattern);
      risks.push({
        title,
        category,
        severity,
        description: `${description} (${matches.length} occurrence${matches.length > 1 ? 's' : ''})`,
        mitigation: 'Engage legal counsel for detailed review'
      });
    }
  });

  // Check for missing legal protections
  if (!lowerText.includes('limit') && !lowerText.includes('liability')) {
    risks.push({
      title: 'Missing Liability Limitations',
      category: 'Legal',
      severity: 'high',
      description: 'No apparent liability limitations found',
      mitigation: 'Ensure liability caps and limitations are included'
    });
  }

  return risks;
}

/**
 * Identify commercial risks
 */
function identifyCommercialRisks(text) {
  const risks = [];
  const lowerText = text.toLowerCase();

  // Payment terms risks
  if (lowerText.includes('payment') || lowerText.includes('fee')) {
    if (!lowerText.includes('net 30') && !lowerText.includes('net 60') && !lowerText.includes('upon receipt')) {
      risks.push({
        title: 'Unclear Payment Terms',
        category: 'Commercial',
        severity: 'high',
        description: 'Payment terms are not clearly specified',
        mitigation: 'Define explicit payment terms and schedules'
      });
    }
  }

  // Exclusivity concerns
  if (/\b(?:exclusive|exclusivity)\b/gi.test(text)) {
    risks.push({
      title: 'Exclusivity Provisions',
      category: 'Commercial',
      severity: 'high',
      description: 'Exclusivity terms identified - assess impact on business flexibility',
      mitigation: 'Review scope, duration, and territory of exclusivity'
    });
  }

  // Performance metrics
  if (/\b(?:kpi|metric|performance|benchmark)\b/gi.test(text)) {
    risks.push({
      title: 'Performance Obligations',
      category: 'Commercial',
      severity: 'medium',
      description: 'Performance metrics or KPIs referenced - ensure achievability',
      mitigation: 'Verify all performance targets are realistic and measurable'
    });
  }

  // Auto-renewal
  if (/\b(?:auto-renew|automatic renewal|automatically renew)\b/gi.test(text)) {
    risks.push({
      title: 'Auto-Renewal Terms',
      category: 'Commercial',
      severity: 'medium',
      description: 'Auto-renewal provisions found - note cancellation requirements',
      mitigation: 'Ensure clear opt-out procedures and adequate notice periods'
    });
  }

  return risks;
}

/**
 * Identify financial risks
 */
function identifyFinancialRisks(text) {
  const risks = [];
  const lowerText = text.toLowerCase();

  // Currency risk
  const currencies = text.match(/(?:USD|GBP|EUR|£|\$|€)/g);
  if (currencies && new Set(currencies).size > 1) {
    risks.push({
      title: 'Multi-Currency Exposure',
      category: 'Financial',
      severity: 'medium',
      description: 'Multiple currencies detected - consider FX risk',
      mitigation: 'Define exchange rate mechanism and responsibility for FX fluctuations'
    });
  }

  // Large amounts without caps
  const largeAmounts = text.match(/(?:\$|£|€)\s*[\d,]+,\d{3}/g);
  if (largeAmounts && largeAmounts.length > 0 && !lowerText.includes('cap') && !lowerText.includes('limit')) {
    risks.push({
      title: 'Uncapped Financial Exposure',
      category: 'Financial',
      severity: 'critical',
      description: 'Significant financial amounts without apparent caps or limits',
      mitigation: 'Implement financial caps and maximum liability provisions'
    });
  }

  // Budget overruns
  if (/\b(?:cost overrun|budget increase|additional cost)\b/gi.test(text)) {
    risks.push({
      title: 'Cost Overrun Provisions',
      category: 'Financial',
      severity: 'high',
      description: 'Cost overrun language detected - clarify responsibility',
      mitigation: 'Define change order process and approval thresholds'
    });
  }

  // Late payment penalties
  if (!lowerText.includes('late') && !lowerText.includes('interest') && lowerText.includes('payment')) {
    risks.push({
      title: 'No Late Payment Protection',
      category: 'Financial',
      severity: 'medium',
      description: 'No late payment penalties or interest provisions found',
      mitigation: 'Add late payment interest and penalty clauses'
    });
  }

  return risks;
}

/**
 * Identify operational risks
 */
function identifyOperationalRisks(text) {
  const risks = [];
  const lowerText = text.toLowerCase();

  // Resource dependencies
  if (/\b(?:key person|key personnel|specific individual)\b/gi.test(text)) {
    risks.push({
      title: 'Key Person Dependency',
      category: 'Operational',
      severity: 'high',
      description: 'Dependency on specific individuals identified',
      mitigation: 'Ensure backup resources and succession planning'
    });
  }

  // Third-party dependencies
  if (/\b(?:third party|vendor|supplier|subcontractor)\b/gi.test(text)) {
    risks.push({
      title: 'Third-Party Dependencies',
      category: 'Operational',
      severity: 'medium',
      description: 'Reliance on third parties noted',
      mitigation: 'Review vendor qualifications and backup options'
    });
  }

  // Force majeure
  if (!lowerText.includes('force majeure') && !lowerText.includes('act of god')) {
    risks.push({
      title: 'No Force Majeure Provision',
      category: 'Operational',
      severity: 'medium',
      description: 'No force majeure or disruption provisions found',
      mitigation: 'Consider adding force majeure clause'
    });
  }

  // Deliverable specifications
  if (lowerText.includes('deliverable') && !lowerText.includes('specification') && !lowerText.includes('criteria')) {
    risks.push({
      title: 'Vague Deliverable Specifications',
      category: 'Operational',
      severity: 'high',
      description: 'Deliverables mentioned without clear acceptance criteria',
      mitigation: 'Define detailed specifications and acceptance procedures'
    });
  }

  return risks;
}

/**
 * Identify timeline risks
 */
function identifyTimelineRisks(text) {
  const risks = [];
  const lowerText = text.toLowerCase();

  // Aggressive timelines
  if (/\b(?:asap|immediately|urgent|rush)\b/gi.test(text)) {
    risks.push({
      title: 'Aggressive Timeline',
      category: 'Timeline',
      severity: 'high',
      description: 'Urgent or immediate delivery requirements detected',
      mitigation: 'Assess feasibility and resource availability'
    });
  }

  // Multiple deadlines
  const dates = text.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g);
  if (dates && dates.length > 5) {
    risks.push({
      title: 'Complex Timeline with Multiple Milestones',
      category: 'Timeline',
      severity: 'medium',
      description: `${dates.length} dates identified - requires careful schedule management`,
      mitigation: 'Create detailed project plan with milestone tracking'
    });
  }

  // Missing deadlines
  if ((lowerText.includes('deliver') || lowerText.includes('provide')) && !dates) {
    risks.push({
      title: 'Undefined Deadlines',
      category: 'Timeline',
      severity: 'high',
      description: 'Obligations present without clear deadlines',
      mitigation: 'Define specific deadlines for all deliverables'
    });
  }

  return risks;
}

/**
 * Identify IP risks
 */
function identifyIPRisks(text) {
  const risks = [];
  const lowerText = text.toLowerCase();

  // IP ownership ambiguity
  if (lowerText.includes('intellectual property') || lowerText.includes('copyright')) {
    if (!lowerText.includes('own') && !lowerText.includes('assign')) {
      risks.push({
        title: 'Unclear IP Ownership',
        category: 'IP',
        severity: 'critical',
        description: 'IP mentioned without clear ownership provisions',
        mitigation: 'Explicitly define IP ownership and assignment terms'
      });
    }
  }

  // Licensing terms
  if (/\b(?:license|licens)\b/gi.test(text)) {
    if (!lowerText.includes('territory') || !lowerText.includes('duration')) {
      risks.push({
        title: 'Incomplete License Terms',
        category: 'IP',
        severity: 'high',
        description: 'License terms may be incomplete',
        mitigation: 'Specify scope, territory, duration, and exclusivity of license'
      });
    }
  }

  // Moral rights
  if (lowerText.includes('creative') || lowerText.includes('artist') || lowerText.includes('author')) {
    if (!lowerText.includes('moral right')) {
      risks.push({
        title: 'Moral Rights Not Addressed',
        category: 'IP',
        severity: 'medium',
        description: 'Creative work involved but moral rights not mentioned',
        mitigation: 'Address waiver or retention of moral rights'
      });
    }
  }

  return risks;
}

/**
 * Calculate overall risk score
 */
export function calculateRiskScore(risks) {
  const weights = {
    critical: 10,
    high: 5,
    medium: 2,
    low: 1
  };

  let score = 0;
  risks.forEach(risk => {
    score += weights[risk.severity] || 0;
  });

  return {
    score,
    level: score > 30 ? 'critical' : score > 15 ? 'high' : score > 5 ? 'medium' : 'low',
    criticalCount: risks.filter(r => r.severity === 'critical').length,
    highCount: risks.filter(r => r.severity === 'high').length
  };
}

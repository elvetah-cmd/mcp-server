// ============================================
// PARSERS - Business Affairs Document Parsers
// ============================================

/**
 * Extract structured deal terms from contract text
 */
export function parseContractTerms(text) {
  const terms = {
    parties: extractParties(text),
    financials: extractFinancials(text),
    dates: extractDates(text),
    deliverables: extractDeliverables(text),
    paymentTerms: extractPaymentTerms(text),
    ipRights: extractIPRights(text),
    territories: extractTerritories(text)
  };

  return terms;
}

/**
 * Extract parties from contract text
 */
function extractParties(text) {
  const parties = [];
  const patterns = [
    /(?:between|by and between)\s+([A-Z][^,\n]+?)(?:\s+and\s+|\s*,\s*)/gi,
    /party:\s*([^\n]+)/gi,
    /client:\s*([^\n]+)/gi,
    /vendor:\s*([^\n]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 0) {
        parties.push(match[1].trim());
      }
    }
  });

  return [...new Set(parties)];
}

/**
 * Extract financial terms
 */
function extractFinancials(text) {
  const financials = {
    amounts: [],
    currencies: [],
    budgets: [],
    fees: []
  };

  // Extract currency amounts
  const amountPattern = /(?:USD|GBP|EUR|£|\$|€)\s*[\d,]+(?:\.\d{2})?(?:\s*(?:million|k|thousand))?/gi;
  const amounts = text.matchAll(amountPattern);
  for (const match of amounts) {
    financials.amounts.push(match[0]);
  }

  // Extract budget lines
  const budgetPattern = /budget[:\s]+([^\n]+)/gi;
  const budgets = text.matchAll(budgetPattern);
  for (const match of budgets) {
    financials.budgets.push(match[1].trim());
  }

  return financials;
}

/**
 * Extract dates and deadlines
 */
function extractDates(text) {
  const dates = {
    deadlines: [],
    milestones: [],
    startDate: null,
    endDate: null
  };

  // Extract various date formats
  const datePatterns = [
    /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/g,
    /\d{4}-\d{2}-\d{2}/g,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/gi
  ];

  datePatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      dates.deadlines.push(match[0]);
    }
  });

  // Extract specific deadline mentions
  const deadlinePattern = /(?:deadline|due date|delivery date)[:\s]+([^\n]+)/gi;
  const deadlines = text.matchAll(deadlinePattern);
  for (const match of deadlines) {
    dates.milestones.push(match[1].trim());
  }

  return dates;
}

/**
 * Extract deliverables
 */
function extractDeliverables(text) {
  const deliverables = [];
  const patterns = [
    /deliverable[s]?[:\s]+([^\n]+)/gi,
    /(?:shall deliver|will provide|agrees to deliver)[:\s]+([^\n]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      deliverables.push(match[1].trim());
    }
  });

  return deliverables;
}

/**
 * Extract payment terms
 */
function extractPaymentTerms(text) {
  const terms = [];
  const pattern = /payment[s]?[:\s]+([^\n\.]+)/gi;
  const matches = text.matchAll(pattern);

  for (const match of matches) {
    terms.push(match[1].trim());
  }

  return terms;
}

/**
 * Extract IP rights and licensing terms
 */
function extractIPRights(text) {
  const ipRights = {
    copyrights: [],
    licenses: [],
    restrictions: []
  };

  const patterns = {
    copyrights: /copyright[s]?[:\s]+([^\n]+)/gi,
    licenses: /licens(?:e|ing)[:\s]+([^\n]+)/gi,
    restrictions: /restriction[s]?[:\s]+([^\n]+)/gi
  };

  Object.keys(patterns).forEach(key => {
    const matches = text.matchAll(patterns[key]);
    for (const match of matches) {
      ipRights[key].push(match[1].trim());
    }
  });

  return ipRights;
}

/**
 * Extract territories
 */
function extractTerritories(text) {
  const territories = [];
  const pattern = /territor(?:y|ies)[:\s]+([^\n]+)/gi;
  const matches = text.matchAll(pattern);

  for (const match of matches) {
    territories.push(match[1].trim());
  }

  return territories;
}

/**
 * Parse email content into structured format
 */
export function parseEmail(emailText) {
  const email = {
    from: extractEmailField(emailText, 'from'),
    to: extractEmailField(emailText, 'to'),
    cc: extractEmailField(emailText, 'cc'),
    subject: extractEmailField(emailText, 'subject'),
    date: extractEmailField(emailText, 'date'),
    body: extractEmailBody(emailText),
    attachments: extractAttachments(emailText),
    actionItems: extractActionItems(emailText)
  };

  return email;
}

function extractEmailField(text, field) {
  const pattern = new RegExp(`${field}[:\\s]+([^\\n]+)`, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function extractEmailBody(text) {
  // Extract text after headers
  const bodyMatch = text.match(/\n\n([\s\S]+)$/);
  return bodyMatch ? bodyMatch[1].trim() : text;
}

function extractAttachments(text) {
  const attachments = [];
  const pattern = /attachment[s]?[:\s]+([^\n]+)/gi;
  const matches = text.matchAll(pattern);

  for (const match of matches) {
    attachments.push(match[1].trim());
  }

  return attachments;
}

function extractActionItems(text) {
  const items = [];
  const patterns = [
    /(?:please|kindly|could you)[^\.]+/gi,
    /action[:\s]+([^\n]+)/gi,
    /to-?do[:\s]+([^\n]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      items.push(match[0].trim());
    }
  });

  return items;
}

/**
 * Parse budget/financial documents
 */
export function parseBudget(budgetText) {
  const budget = {
    totalBudget: null,
    lineItems: [],
    categories: {},
    contingency: null,
    currency: extractCurrency(budgetText)
  };

  // Extract line items
  const linePattern = /^[\s]*([^:$£€\d\n]+)[:\s]+([\$£€]?[\d,]+\.?\d*)/gm;
  const matches = budgetText.matchAll(linePattern);

  for (const match of matches) {
    const item = {
      description: match[1].trim(),
      amount: parseFloat(match[2].replace(/[^\d.]/g, ''))
    };
    budget.lineItems.push(item);
  }

  return budget;
}

function extractCurrency(text) {
  const currencyMatch = text.match(/(?:USD|GBP|EUR|£|\$|€)/);
  if (currencyMatch) {
    const map = { '$': 'USD', '£': 'GBP', '€': 'EUR' };
    return map[currencyMatch[0]] || currencyMatch[0];
  }
  return 'USD';
}

/**
 * Parse meeting transcripts
 */
export function parseTranscript(transcriptText) {
  const transcript = {
    speakers: [],
    topics: [],
    actionItems: [],
    decisions: [],
    followUps: []
  };

  // Extract speakers
  const speakerPattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)[:\s]/gm;
  const speakers = transcriptText.matchAll(speakerPattern);
  const speakerSet = new Set();

  for (const match of speakers) {
    speakerSet.add(match[1].trim());
  }
  transcript.speakers = Array.from(speakerSet);

  // Extract action items
  const actionPatterns = [
    /action[:\s]+([^\n]+)/gi,
    /([A-Z][a-z]+)\s+(?:will|to)\s+([^\n\.]+)/g,
    /(?:agreed to|committed to|will)\s+([^\n\.]+)/gi
  ];

  actionPatterns.forEach(pattern => {
    const matches = transcriptText.matchAll(pattern);
    for (const match of matches) {
      transcript.actionItems.push(match[1] ? match[1].trim() : match[0].trim());
    }
  });

  // Extract decisions
  const decisionPattern = /(?:decided|agreed|resolved)[:\s]+([^\n]+)/gi;
  const decisions = transcriptText.matchAll(decisionPattern);

  for (const match of decisions) {
    transcript.decisions.push(match[1].trim());
  }

  return transcript;
}

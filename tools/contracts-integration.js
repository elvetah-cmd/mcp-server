// ============================================
// CONTRACTS INTEGRATION TOOLS
// ============================================

import { parseContractTerms } from '../lib/parsers.js';
import { formatDealSummary, formatLegalClause, formatIPSummary } from '../lib/formatters.js';
import { validateContract, validateDealTerms, validateClause } from '../lib/validators.js';
import { analyzeRisks, calculateRiskScore } from '../lib/risk-analyzer.js';
import { formatRiskAnalysis } from '../lib/formatters.js';
import { contextManager } from '../lib/context-manager.js';

/**
 * Contract management tool definitions for MCP
 */
export const contractTools = {
  /**
   * Extract and structure deal terms from contract
   */
  extract_deal_terms: {
    description: 'Extract key commercial and legal terms from contract text and output structured deal parameters',
    inputSchema: {
      type: 'object',
      properties: {
        contractText: {
          type: 'string',
          description: 'Full contract text or relevant sections'
        },
        projectId: {
          type: 'string',
          description: 'Project ID to associate contract with'
        }
      },
      required: ['contractText']
    },
    execute: async ({ contractText, projectId }) => {
      // Parse contract terms
      const terms = parseContractTerms(contractText);

      // Validate completeness
      const validation = validateDealTerms(terms);

      // Format summary
      const summary = formatDealSummary(terms);

      // Store in context
      if (projectId) {
        try {
          contextManager.addDocument(projectId, {
            type: 'contract',
            title: 'Contract Terms',
            content: contractText,
            extractedTerms: terms,
            validation
          });
        } catch (err) {
          // Project might not exist
        }
      }

      return {
        text: summary + '\n\n' +
          `COMPLETENESS: ${validation.completeness}%\n\n` +
          (validation.issues.length > 0 ?
            '⚠ GAPS IDENTIFIED:\n' + validation.issues.map(i => `  - ${i.message} (${i.category})`).join('\n') :
            '✓ All key deal components present')
      };
    }
  },

  /**
   * Analyze contract risks
   */
  flag_contract_risks: {
    description: 'Identify legal, commercial, financial, and operational risks in contract text',
    inputSchema: {
      type: 'object',
      properties: {
        contractText: {
          type: 'string',
          description: 'Contract text to analyze'
        },
        projectId: {
          type: 'string',
          description: 'Project ID to log risks to'
        }
      },
      required: ['contractText']
    },
    execute: async ({ contractText, projectId }) => {
      // Analyze risks
      const risks = analyzeRisks(contractText);

      // Calculate risk score
      const riskScore = calculateRiskScore(risks);

      // Format report
      const report = formatRiskAnalysis(risks);

      // Store risks in context
      if (projectId) {
        try {
          risks.forEach(risk => {
            if (risk.severity === 'critical' || risk.severity === 'high') {
              contextManager.addRisk(projectId, risk);
            }
          });
        } catch (err) {
          // Project might not exist
        }
      }

      return {
        text: report + '\n\n' +
          `OVERALL RISK LEVEL: ${riskScore.level.toUpperCase()}\n` +
          `RISK SCORE: ${riskScore.score}/100\n\n` +
          '🔍 RECOMMENDATION:\n' +
          getRiskRecommendation(riskScore.level)
      };
    }
  },

  /**
   * Draft legal clause
   */
  draft_clause: {
    description: 'Draft a legal clause based on specifications and jurisdiction',
    inputSchema: {
      type: 'object',
      properties: {
        clauseType: {
          type: 'string',
          enum: [
            'confidentiality',
            'indemnification',
            'limitation_of_liability',
            'termination',
            'ip_assignment',
            'payment_terms',
            'warranties',
            'force_majeure',
            'dispute_resolution',
            'non_compete'
          ],
          description: 'Type of clause to draft'
        },
        specifications: {
          type: 'string',
          description: 'Specific requirements or parameters for the clause'
        },
        jurisdiction: {
          type: 'string',
          description: 'Governing jurisdiction (e.g., England & Wales, New York, California)',
          default: 'England & Wales'
        },
        favorability: {
          type: 'string',
          enum: ['seller', 'buyer', 'balanced'],
          description: 'Which party should the clause favor',
          default: 'balanced'
        }
      },
      required: ['clauseType', 'specifications']
    },
    execute: async ({ clauseType, specifications, jurisdiction = 'England & Wales', favorability = 'balanced' }) => {
      // Generate clause based on type and specs
      const clause = generateClause(clauseType, specifications, jurisdiction, favorability);

      // Validate clause structure
      const validation = validateClause(clause);

      // Format output
      const formatted = formatLegalClause(clause);

      return {
        text: formatted + '\n\n' +
          (validation.issues.length > 0 ?
            '⚠ DRAFTING NOTES:\n' + validation.issues.map(i => `  - ${i.message}`).join('\n') :
            '✓ Clause structure validated') +
          '\n\n' +
          '📝 NEXT STEPS:\n' +
          '  1. Review with legal counsel\n' +
          '  2. Customize for specific deal context\n' +
          '  3. Ensure consistency with other contract provisions\n' +
          '  4. Verify compliance with local law requirements'
      };
    }
  },

  /**
   * Compare contract versions
   */
  compare_contract_versions: {
    description: 'Compare two contract versions and highlight differences',
    inputSchema: {
      type: 'object',
      properties: {
        originalText: {
          type: 'string',
          description: 'Original contract version'
        },
        revisedText: {
          type: 'string',
          description: 'Revised contract version'
        }
      },
      required: ['originalText', 'revisedText']
    },
    execute: async ({ originalText, revisedText }) => {
      // Extract terms from both versions
      const originalTerms = parseContractTerms(originalText);
      const revisedTerms = parseContractTerms(revisedText);

      // Compare key sections
      const differences = compareTerms(originalTerms, revisedTerms);

      return {
        text: `═══════════════════════════════════════
      CONTRACT COMPARISON
═══════════════════════════════════════

${differences.map(diff => `
${diff.section}:
  Change Type: ${diff.type}
  Original: ${diff.original}
  Revised: ${diff.revised}
  Impact: ${diff.impact}
`).join('\n')}

───────────────────────────────────────
TOTAL CHANGES: ${differences.length}
MATERIAL CHANGES: ${differences.filter(d => d.impact === 'material').length}
═══════════════════════════════════════

⚠ MATERIAL CHANGES REQUIRE CAREFUL REVIEW`
      };
    }
  },

  /**
   * Extract IP terms
   */
  extract_ip_rights: {
    description: 'Extract and structure intellectual property rights and licensing terms',
    inputSchema: {
      type: 'object',
      properties: {
        contractText: {
          type: 'string',
          description: 'Contract text containing IP provisions'
        }
      },
      required: ['contractText']
    },
    execute: async ({ contractText }) => {
      // Parse contract to extract IP terms
      const terms = parseContractTerms(contractText);

      // Format IP summary
      const summary = formatIPSummary(terms.ipRights);

      // Analyze IP risks
      const ipRisks = analyzeRisks(contractText).filter(r => r.category === 'IP');

      return {
        text: summary +
          (ipRisks.length > 0 ?
            '\n\n🔍 IP RISKS:\n' +
            ipRisks.map(r => `  ⚠ ${r.title}: ${r.description}`).join('\n') :
            '\n\n✓ No major IP risks identified')
      };
    }
  },

  /**
   * Generate contract checklist
   */
  generate_contract_checklist: {
    description: 'Generate a due diligence checklist for contract review',
    inputSchema: {
      type: 'object',
      properties: {
        contractType: {
          type: 'string',
          enum: ['production', 'distribution', 'licensing', 'employment', 'vendor', 'talent'],
          description: 'Type of contract'
        },
        dealSize: {
          type: 'string',
          enum: ['small', 'medium', 'large'],
          description: 'Deal size category',
          default: 'medium'
        }
      },
      required: ['contractType']
    },
    execute: async ({ contractType, dealSize = 'medium' }) => {
      const checklist = generateContractChecklist(contractType, dealSize);

      return {
        text: `═══════════════════════════════════════
   CONTRACT REVIEW CHECKLIST
   Type: ${contractType.toUpperCase()}
   Size: ${dealSize.toUpperCase()}
═══════════════════════════════════════

${checklist.map((item, idx) => `
${idx + 1}. ${item.section}
   ${item.items.map(i => `□ ${i}`).join('\n   ')}
`).join('\n')}

═══════════════════════════════════════`
      };
    }
  }
};

/**
 * Generate risk recommendation based on level
 */
function getRiskRecommendation(level) {
  const recommendations = {
    critical: '🚨 DO NOT SIGN without senior legal review and risk mitigation. Multiple critical issues require immediate attention.',
    high: '⚠ Requires detailed legal review and negotiation. High-priority risks should be addressed before execution.',
    medium: '⚡ Standard legal review recommended. Address medium risks during negotiation phase.',
    low: '✓ Proceed with standard approval process. Minor risks are within acceptable parameters.'
  };

  return recommendations[level] || recommendations.medium;
}

/**
 * Generate legal clause based on type
 */
function generateClause(type, specifications, jurisdiction, favorability) {
  const clauseTemplates = {
    confidentiality: {
      title: 'Confidentiality and Non-Disclosure',
      text: `The Receiving Party agrees to hold in confidence and not disclose to any third parties any Confidential Information disclosed by the Disclosing Party, except as expressly permitted herein.

"Confidential Information" means ${specifications}.

The Receiving Party shall:
(a) use the Confidential Information solely for the purposes of ${specifications};
(b) protect the Confidential Information using the same degree of care as it uses for its own confidential information, but in no event less than reasonable care;
(c) limit disclosure to employees and contractors with a legitimate need to know.

This obligation shall survive for a period of [TERM] years from the date of disclosure.

Governing Law: ${jurisdiction}`,
      notes: `Review term length based on industry standards. Consider exceptions for legally required disclosures. Ensure definition of Confidential Information is appropriately scoped for ${favorability} party.`
    },
    limitation_of_liability: {
      title: 'Limitation of Liability',
      text: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO THIS AGREEMENT.

THE TOTAL LIABILITY OF EITHER PARTY SHALL NOT EXCEED ${specifications}.

Nothing in this clause shall limit liability for:
(a) death or personal injury caused by negligence;
(b) fraud or fraudulent misrepresentation;
(c) breach of confidentiality obligations; or
(d) any other liability which cannot be excluded by law.

Jurisdiction: ${jurisdiction}`,
      notes: `Ensure cap amount is appropriate for deal value. Consider separate caps for different categories of liability. Verify enforceability under ${jurisdiction} law. Current favorability: ${favorability}.`
    },
    termination: {
      title: 'Termination',
      text: `Either Party may terminate this Agreement:

(a) for convenience upon [NOTICE PERIOD] written notice to the other Party;
(b) immediately upon written notice if the other Party commits a material breach and fails to cure within [CURE PERIOD] days of receiving notice;
(c) immediately if the other Party becomes insolvent, files for bankruptcy, or ceases business operations.

Upon termination, ${specifications}.

Sections [SURVIVING SECTIONS] shall survive termination.

Governing Law: ${jurisdiction}`,
      notes: `Define appropriate notice and cure periods. Specify treatment of payments, deliverables, and IP upon termination. Consider wind-down provisions for ${favorability} party.`
    },
    ip_assignment: {
      title: 'Intellectual Property Assignment',
      text: `All Work Product created by [ASSIGNOR] under this Agreement shall be deemed "works made for hire" under applicable copyright law. To the extent any Work Product does not qualify as work made for hire, [ASSIGNOR] hereby irrevocably assigns to [ASSIGNEE] all right, title, and interest in and to such Work Product, including all intellectual property rights therein.

"Work Product" means ${specifications}.

[ASSIGNOR] shall execute all documents and take all actions reasonably necessary to perfect [ASSIGNEE]'s rights in the Work Product.

[ASSIGNOR] hereby waives all moral rights in the Work Product to the extent permitted by law.

Jurisdiction: ${jurisdiction}`,
      notes: `Verify work-for-hire applies under ${jurisdiction} law. Consider territory limitations. Address pre-existing IP and improvements. Ensure moral rights waiver is valid. Drafted favoring ${favorability} party.`
    }
  };

  return clauseTemplates[type] || {
    title: type.replace(/_/g, ' ').toUpperCase(),
    text: `[CLAUSE TO BE DRAFTED]\n\nSpecifications: ${specifications}\nJurisdiction: ${jurisdiction}\nFavorability: ${favorability}`,
    notes: 'Custom clause requires specific legal drafting.'
  };
}

/**
 * Compare contract terms
 */
function compareTerms(original, revised) {
  const differences = [];

  // Compare parties
  if (JSON.stringify(original.parties) !== JSON.stringify(revised.parties)) {
    differences.push({
      section: 'Parties',
      type: 'modified',
      original: original.parties.join(', '),
      revised: revised.parties.join(', '),
      impact: 'material'
    });
  }

  // Compare financials
  if (JSON.stringify(original.financials) !== JSON.stringify(revised.financials)) {
    differences.push({
      section: 'Financial Terms',
      type: 'modified',
      original: original.financials.amounts.join(', ') || 'Not specified',
      revised: revised.financials.amounts.join(', ') || 'Not specified',
      impact: 'material'
    });
  }

  // Compare dates
  if (JSON.stringify(original.dates) !== JSON.stringify(revised.dates)) {
    differences.push({
      section: 'Key Dates',
      type: 'modified',
      original: original.dates.deadlines.length + ' dates',
      revised: revised.dates.deadlines.length + ' dates',
      impact: 'significant'
    });
  }

  return differences;
}

/**
 * Generate contract checklist
 */
function generateContractChecklist(contractType, dealSize) {
  const baseChecklist = [
    {
      section: 'Parties & Signatures',
      items: [
        'All parties correctly identified with legal names',
        'Authorized signatories confirmed',
        'Corporate authority verified',
        'All signature blocks complete'
      ]
    },
    {
      section: 'Commercial Terms',
      items: [
        'Scope of work clearly defined',
        'Pricing and payment terms specified',
        'Deliverables and acceptance criteria',
        'Performance obligations clear'
      ]
    },
    {
      section: 'Legal Protections',
      items: [
        'Limitation of liability clause present',
        'Indemnification provisions reviewed',
        'Insurance requirements adequate',
        'Warranty disclaimers appropriate'
      ]
    },
    {
      section: 'IP & Confidentiality',
      items: [
        'IP ownership clearly allocated',
        'License terms specified (if applicable)',
        'Confidentiality obligations defined',
        'Data protection compliance'
      ]
    },
    {
      section: 'Term & Termination',
      items: [
        'Contract term specified',
        'Termination rights balanced',
        'Notice periods appropriate',
        'Survival provisions included'
      ]
    }
  ];

  // Add deal-size specific items
  if (dealSize === 'large') {
    baseChecklist.push({
      section: 'Enhanced Due Diligence',
      items: [
        'Third-party beneficiary rights',
        'Change of control provisions',
        'Force majeure clause',
        'Dispute resolution mechanism',
        'Governing law and jurisdiction'
      ]
    });
  }

  return baseChecklist;
}

export default contractTools;

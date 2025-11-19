// ============================================
// EMAIL INTEGRATION TOOLS
// ============================================

import { parseEmail } from '../lib/parsers.js';
import { formatEmailBrief } from '../lib/formatters.js';
import { validateEmail } from '../lib/validators.js';
import { contextManager } from '../lib/context-manager.js';

/**
 * Email integration tool definitions for MCP
 */
export const emailTools = {
  /**
   * Fetch emails from inbox
   */
  fetch_emails: {
    description: 'Fetch recent emails from inbox (Gmail/Outlook integration placeholder)',
    inputSchema: {
      type: 'object',
      properties: {
        folder: {
          type: 'string',
          description: 'Email folder (inbox, sent, drafts)',
          default: 'inbox'
        },
        limit: {
          type: 'number',
          description: 'Number of emails to fetch',
          default: 10
        },
        filter: {
          type: 'string',
          description: 'Filter criteria (unread, flagged, from:email@domain.com)'
        }
      }
    },
    execute: async ({ folder = 'inbox', limit = 10, filter }) => {
      // PLACEHOLDER: Implement Gmail API or Outlook API integration
      // For now, return mock structure showing expected format

      return {
        text: `Email Integration Placeholder

CONFIGURATION REQUIRED:
To enable email integration, configure one of:
  1. Gmail API (OAuth 2.0)
  2. Outlook API (Microsoft Graph)
  3. IMAP/SMTP credentials

Fetching ${limit} emails from ${folder}${filter ? ` with filter: ${filter}` : ''}

Expected Response Format:
{
  emails: [
    {
      id: "email_id",
      from: "sender@company.com",
      to: ["recipient@company.com"],
      subject: "Subject line",
      date: "2025-11-19T10:00:00Z",
      body: "Email content...",
      attachments: ["document.pdf"],
      isRead: false,
      hasAttachments: true
    }
  ],
  total: 10
}

INTEGRATION STEPS:
1. npm install googleapis (for Gmail) or @microsoft/microsoft-graph-client (for Outlook)
2. Set up OAuth credentials in config/settings.js
3. Implement authentication flow
4. Replace this placeholder with actual API calls`
      };
    }
  },

  /**
   * Parse and summarize email
   */
  summarize_email: {
    description: 'Parse email content and generate executive brief with action items',
    inputSchema: {
      type: 'object',
      properties: {
        emailText: {
          type: 'string',
          description: 'Full email text including headers and body'
        },
        projectId: {
          type: 'string',
          description: 'Optional project ID to associate email with'
        }
      },
      required: ['emailText']
    },
    execute: async ({ emailText, projectId }) => {
      // Parse email
      const parsed = parseEmail(emailText);

      // Validate
      const validation = validateEmail(parsed);

      // Format as executive brief
      const brief = formatEmailBrief(parsed);

      // Store in context if project specified
      if (projectId) {
        try {
          contextManager.addDocument(projectId, {
            type: 'email',
            title: parsed.subject,
            content: emailText,
            metadata: {
              from: parsed.from,
              date: parsed.date,
              actionItems: parsed.actionItems
            }
          });

          // Add action items as tasks
          if (parsed.actionItems && parsed.actionItems.length > 0) {
            parsed.actionItems.forEach(item => {
              contextManager.addTask(projectId, {
                description: item,
                priority: 'normal',
                source: 'email'
              });
            });
          }
        } catch (err) {
          // Project might not exist, continue anyway
        }
      }

      return {
        text: brief + '\n\nValidation:\n' +
          (validation.isValid ? '✓ Email structure valid' :
           '⚠ Issues found:\n' + validation.issues.map(i => `  - ${i.message}`).join('\n'))
      };
    }
  },

  /**
   * Draft email response
   */
  draft_email_response: {
    description: 'Draft a professional email response based on context and instructions',
    inputSchema: {
      type: 'object',
      properties: {
        originalEmail: {
          type: 'string',
          description: 'Original email text being responded to'
        },
        instructions: {
          type: 'string',
          description: 'Instructions for the response (e.g., "accept the proposal", "request more time")'
        },
        tone: {
          type: 'string',
          enum: ['formal', 'professional', 'friendly', 'assertive'],
          description: 'Tone of the response',
          default: 'professional'
        }
      },
      required: ['originalEmail', 'instructions']
    },
    execute: async ({ originalEmail, instructions, tone = 'professional' }) => {
      const parsed = parseEmail(originalEmail);

      // Generate response structure
      const response = {
        to: parsed.from,
        subject: parsed.subject.startsWith('Re:') ? parsed.subject : `Re: ${parsed.subject}`,
        body: generateEmailResponse(parsed, instructions, tone)
      };

      return {
        text: `═══════════════════════════════════════
           DRAFT EMAIL RESPONSE
═══════════════════════════════════════

To: ${response.to}
Subject: ${response.subject}
Tone: ${tone}

───────────────────────────────────────

${response.body}

───────────────────────────────────────

📝 REVIEW CHECKLIST:
□ Addresses all points from original email
□ Follows ${tone} tone
□ Implements instructions: ${instructions}
□ Includes clear next steps
□ Professional signature required

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Extract action items from email thread
   */
  extract_email_actions: {
    description: 'Extract all action items and commitments from email thread',
    inputSchema: {
      type: 'object',
      properties: {
        emailThread: {
          type: 'string',
          description: 'Complete email thread text'
        },
        assignees: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of people mentioned in thread'
        }
      },
      required: ['emailThread']
    },
    execute: async ({ emailThread, assignees = [] }) => {
      const parsed = parseEmail(emailThread);

      // Enhanced action item extraction
      const actions = parsed.actionItems.map((item, idx) => {
        // Try to identify assignee from text
        let assignee = null;
        assignees.forEach(name => {
          if (item.toLowerCase().includes(name.toLowerCase())) {
            assignee = name;
          }
        });

        // Infer priority
        const isUrgent = /urgent|asap|immediately|today/i.test(item);
        const priority = isUrgent ? 'urgent' : 'normal';

        return {
          id: idx + 1,
          description: item,
          assignee,
          priority,
          source: 'email',
          extractedFrom: parsed.subject
        };
      });

      return {
        text: `═══════════════════════════════════════
      ACTION ITEMS FROM EMAIL
═══════════════════════════════════════

${actions.map(action => `
${action.id}. ${action.description}
   Priority: ${action.priority}
   ${action.assignee ? `Assigned to: ${action.assignee}` : 'Unassigned'}
`).join('\n')}

───────────────────────────────────────
TOTAL ACTIONS: ${actions.length}
URGENT: ${actions.filter(a => a.priority === 'urgent').length}
═══════════════════════════════════════`
      };
    }
  }
};

/**
 * Generate email response body
 */
function generateEmailResponse(originalEmail, instructions, tone) {
  const greetings = {
    formal: 'Dear ',
    professional: 'Hi ',
    friendly: 'Hey ',
    assertive: 'Dear '
  };

  const closings = {
    formal: 'Yours faithfully',
    professional: 'Best regards',
    friendly: 'Thanks',
    assertive: 'Regards'
  };

  // Extract sender first name if possible
  const senderName = originalEmail.from.split(' ')[0].split('@')[0];

  return `${greetings[tone]}${senderName},

Thank you for your email regarding ${originalEmail.subject}.

[IMPLEMENT: ${instructions}]

[Key points to address based on original email]

Please let me know if you need any additional information.

${closings[tone]}

[Your Name]
[Your Title]
[Company]`;
}

export default emailTools;

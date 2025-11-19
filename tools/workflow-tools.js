// ============================================
// WORKFLOW AUTOMATION TOOLS
// ============================================

import { parseTranscript } from '../lib/parsers.js';
import { formatTaskList, formatDeadlineReminder } from '../lib/formatters.js';
import { validateTask } from '../lib/validators.js';
import { contextManager } from '../lib/context-manager.js';

/**
 * Workflow automation tool definitions for MCP
 */
export const workflowTools = {
  /**
   * Extract tasks from any text
   */
  extract_tasks: {
    description: 'Extract actionable tasks from transcripts, emails, meetings, or any text',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text containing tasks (transcript, email, notes, etc.)'
        },
        projectId: {
          type: 'string',
          description: 'Project ID to associate tasks with'
        },
        defaultPriority: {
          type: 'string',
          enum: ['urgent', 'high', 'normal', 'low'],
          description: 'Default priority for extracted tasks',
          default: 'normal'
        }
      },
      required: ['text']
    },
    execute: async ({ text, projectId, defaultPriority = 'normal' }) => {
      // Parse based on content type
      const isTranscript = /^[A-Z][a-z]+:/m.test(text);
      const parsed = isTranscript ? parseTranscript(text) : { actionItems: extractActionItems(text) };

      // Convert to structured tasks
      const tasks = parsed.actionItems.map((item, idx) => {
        // Infer priority from language
        const priority = inferPriority(item) || defaultPriority;

        // Extract deadline if mentioned
        const deadline = extractDeadline(item);

        // Try to extract assignee
        const assignee = extractAssignee(item);

        return {
          id: idx + 1,
          description: item,
          priority,
          deadline,
          assignee,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
      });

      // Validate tasks
      tasks.forEach(task => {
        const validation = validateTask(task);
        task.validation = validation;
      });

      // Store in context
      if (projectId) {
        try {
          tasks.forEach(task => {
            contextManager.addTask(projectId, task);
          });
        } catch (err) {
          // Project might not exist
        }
      }

      // Format output
      const formatted = formatTaskList(tasks);

      return {
        text: formatted + '\n\n' +
          `📊 EXTRACTION SUMMARY:\n` +
          `  Total Tasks: ${tasks.length}\n` +
          `  Urgent: ${tasks.filter(t => t.priority === 'urgent').length}\n` +
          `  With Deadlines: ${tasks.filter(t => t.deadline).length}\n` +
          `  Assigned: ${tasks.filter(t => t.assignee).length}\n` +
          (projectId ? `\n✓ Tasks added to project ${projectId}` : '')
      };
    }
  },

  /**
   * Check deadlines and send reminders
   */
  check_deadlines: {
    description: 'Check upcoming and overdue deadlines across all projects',
    inputSchema: {
      type: 'object',
      properties: {
        daysAhead: {
          type: 'number',
          description: 'Number of days to look ahead',
          default: 7
        },
        projectId: {
          type: 'string',
          description: 'Filter by specific project (optional)'
        }
      }
    },
    execute: async ({ daysAhead = 7, projectId }) => {
      // Get deadlines
      const upcoming = contextManager.getUpcomingDeadlines(daysAhead);
      const overdue = contextManager.getOverdueDeadlines();

      // Filter by project if specified
      const filteredUpcoming = projectId ? upcoming.filter(d => d.projectId === projectId) : upcoming;
      const filteredOverdue = projectId ? overdue.filter(d => d.projectId === projectId) : overdue;

      const allDeadlines = [...filteredOverdue, ...filteredUpcoming];

      // Format reminder
      const reminder = formatDeadlineReminder(allDeadlines);

      return {
        text: reminder + '\n\n' +
          `📊 DEADLINE STATISTICS:\n` +
          `  Total Monitored: ${allDeadlines.length}\n` +
          `  Overdue: ${filteredOverdue.length}\n` +
          `  Due This Week: ${filteredUpcoming.filter(d => new Date(d.date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}\n\n` +
          (filteredOverdue.length > 0 ?
            '🚨 ACTION REQUIRED: Address overdue items immediately' :
            '✓ No overdue deadlines')
      };
    }
  },

  /**
   * Create project dashboard
   */
  get_dashboard: {
    description: 'Generate comprehensive dashboard with all active projects, tasks, and risks',
    inputSchema: {
      type: 'object',
      properties: {}
    },
    execute: async () => {
      const dashboard = contextManager.getDashboard();

      return {
        text: `═══════════════════════════════════════
     BUSINESS AFFAIRS DASHBOARD
═══════════════════════════════════════

📁 PROJECTS (${dashboard.projects.total})
${dashboard.projects.list.map(p => `  • ${p.name} (Updated: ${new Date(p.lastUpdated).toLocaleDateString()})`).join('\n') || '  No active projects'}

✓ TASKS
  Total: ${dashboard.tasks.total}
  Active: ${dashboard.tasks.active}
  Completed: ${dashboard.tasks.completed}

⚠️  RISKS
  Total: ${dashboard.risks.total}
  Active: ${dashboard.risks.active}

📅 DEADLINES
  Upcoming (7 days): ${dashboard.deadlines.upcoming}
  Overdue: ${dashboard.deadlines.overdue}

📊 RECENT ACTIVITY
${dashboard.recentActivity.map(a => `  • ${a.timestamp.toLocaleString()}: ${a.summary}`).join('\n') || '  No recent activity'}

═══════════════════════════════════════

${dashboard.deadlines.overdue > 0 || dashboard.risks.active > 0 ?
  `\n🚨 ATTENTION REQUIRED:\n` +
  (dashboard.deadlines.overdue > 0 ? `  ⚠ ${dashboard.deadlines.overdue} overdue deadline(s)\n` : '') +
  (dashboard.risks.active > 0 ? `  ⚠ ${dashboard.risks.active} active risk(s)\n` : '') :
  '\n✓ All systems operational'}
`
      };
    }
  },

  /**
   * Track issue or follow-up
   */
  track_issue: {
    description: 'Create and track an issue or follow-up item',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Issue description'
        },
        severity: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low'],
          description: 'Issue severity',
          default: 'medium'
        },
        category: {
          type: 'string',
          enum: ['legal', 'financial', 'operational', 'commercial', 'ip'],
          description: 'Issue category'
        },
        projectId: {
          type: 'string',
          description: 'Associated project'
        },
        dueDate: {
          type: 'string',
          description: 'Due date for resolution'
        }
      },
      required: ['description', 'category']
    },
    execute: async ({ description, severity = 'medium', category, projectId, dueDate }) => {
      const issue = {
        title: description,
        description,
        severity,
        category,
        status: 'active',
        identifiedAt: new Date(),
        projectId,
        dueDate
      };

      // Add to context
      if (projectId) {
        try {
          contextManager.addRisk(projectId, issue);
        } catch (err) {
          // Project might not exist
        }
      }

      // Add as deadline if dueDate specified
      if (dueDate) {
        contextManager.addDeadline({
          description,
          date: dueDate,
          projectId,
          type: 'issue_resolution'
        });
      }

      return {
        text: `═══════════════════════════════════════
        ISSUE TRACKED
═══════════════════════════════════════

Description: ${description}
Severity: ${severity.toUpperCase()}
Category: ${category}
Status: Active
${projectId ? `Project: ${projectId}` : ''}
${dueDate ? `Due Date: ${dueDate}` : ''}

✓ Issue logged and will be monitored
${severity === 'critical' || severity === 'high' ? '\n🚨 High priority - requires immediate attention' : ''}

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Generate follow-up list
   */
  generate_followups: {
    description: 'Generate follow-up list from recent activity and pending items',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Filter by project'
        },
        daysBack: {
          type: 'number',
          description: 'How many days back to look',
          default: 7
        }
      }
    },
    execute: async ({ projectId, daysBack = 7 }) => {
      const recentActivity = contextManager.getRecentActivity(50);
      const pendingTasks = contextManager.getAllProjects()
        .flatMap(p => (projectId && p.id !== projectId) ? [] : p.tasks.filter(t => t.status === 'pending'));

      const activeRisks = contextManager.getActiveIssues();
      const upcomingDeadlines = contextManager.getUpcomingDeadlines(7);

      return {
        text: `═══════════════════════════════════════
         FOLLOW-UP LIST
         Generated: ${new Date().toLocaleDateString()}
═══════════════════════════════════════

🔴 URGENT ACTIONS (${pendingTasks.filter(t => t.priority === 'urgent').length})
${pendingTasks.filter(t => t.priority === 'urgent').map(t =>
  `  • ${t.description}${t.deadline ? ` (Due: ${t.deadline})` : ''}`
).join('\n') || '  None'}

⚠️  ACTIVE RISKS (${activeRisks.length})
${activeRisks.slice(0, 5).map(r =>
  `  • [${r.severity.toUpperCase()}] ${r.title || r.description}`
).join('\n') || '  None'}

📅 UPCOMING DEADLINES (${upcomingDeadlines.length})
${upcomingDeadlines.slice(0, 5).map(d =>
  `  • ${d.description} - ${new Date(d.date).toLocaleDateString()}`
).join('\n') || '  None'}

✓ PENDING TASKS (${pendingTasks.filter(t => t.priority !== 'urgent').length})
${pendingTasks.filter(t => t.priority !== 'urgent').slice(0, 10).map(t =>
  `  • [${t.priority.toUpperCase()}] ${t.description}`
).join('\n') || '  None'}

═══════════════════════════════════════

📝 RECOMMENDED ACTIONS:
  1. Address all urgent items today
  2. Review and mitigate active risks
  3. Prepare for upcoming deadlines
  4. Update task statuses after completion

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Create new project
   */
  create_project: {
    description: 'Create a new project to organize deals, contracts, and tasks',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Project name'
        },
        description: {
          type: 'string',
          description: 'Project description'
        },
        stakeholders: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of stakeholders'
        },
        startDate: {
          type: 'string',
          description: 'Project start date'
        },
        endDate: {
          type: 'string',
          description: 'Project end date'
        }
      },
      required: ['name']
    },
    execute: async ({ name, description, stakeholders = [], startDate, endDate }) => {
      const projectId = contextManager.generateId();

      const project = contextManager.updateProject(projectId, {
        name,
        description,
        stakeholders: stakeholders.map(s => ({ name: s, role: 'Stakeholder' })),
        timeline: {
          startDate,
          endDate
        }
      });

      // Add timeline deadlines
      if (endDate) {
        contextManager.addDeadline({
          description: `${name} - Project completion`,
          date: endDate,
          projectId,
          project: name
        });
      }

      return {
        text: `═══════════════════════════════════════
       PROJECT CREATED
═══════════════════════════════════════

Project ID: ${projectId}
Name: ${name}
${description ? `Description: ${description}` : ''}

${stakeholders.length > 0 ?
  `Stakeholders:\n${stakeholders.map(s => `  • ${s}`).join('\n')}` : ''}

${startDate ? `Start Date: ${startDate}` : ''}
${endDate ? `End Date: ${endDate}` : ''}

✓ Project initialized and ready for:
  • Document uploads
  • Task management
  • Risk tracking
  • Deadline monitoring

═══════════════════════════════════════

NEXT STEPS:
  1. Upload contracts and documents
  2. Add initial tasks and milestones
  3. Set up budget tracking
  4. Configure integrations (Drive, Email)

═══════════════════════════════════════`
      };
    }
  },

  /**
   * Get project summary
   */
  get_project_summary: {
    description: 'Get comprehensive summary of a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID'
        }
      },
      required: ['projectId']
    },
    execute: async ({ projectId }) => {
      try {
        const project = contextManager.getProject(projectId);
        if (!project) {
          return { text: `❌ Project ${projectId} not found` };
        }

        const summary = contextManager.getProjectSummary(projectId);

        return {
          text: `═══════════════════════════════════════
          PROJECT SUMMARY
═══════════════════════════════════════

Project: ${summary.name}
ID: ${summary.id}
Created: ${new Date(summary.created).toLocaleDateString()}
Last Updated: ${new Date(summary.lastUpdated).toLocaleDateString()}

📊 STATISTICS
  Documents: ${summary.stats.documents}
  Total Tasks: ${summary.stats.tasks}
  Active Tasks: ${summary.stats.activeTasks}
  Completed: ${summary.stats.completedTasks}
  Active Risks: ${summary.stats.activeRisks}
  Stakeholders: ${summary.stats.stakeholders}
  Upcoming Deadlines: ${summary.upcomingDeadlines}

${project.stakeholders && project.stakeholders.length > 0 ?
  `\n👥 STAKEHOLDERS\n${project.stakeholders.map(s => `  • ${s.name}${s.role ? ` (${s.role})` : ''}`).join('\n')}` : ''}

${project.notes && project.notes.length > 0 ?
  `\n📝 RECENT NOTES\n${project.notes.slice(-3).map(n => `  • ${new Date(n.timestamp).toLocaleDateString()}: ${n.text.substring(0, 60)}...`).join('\n')}` : ''}

═══════════════════════════════════════`
        };
      } catch (err) {
        return { text: `❌ Error retrieving project: ${err.message}` };
      }
    }
  },

  /**
   * Search across all projects
   */
  search_projects: {
    description: 'Search across all projects for specific terms',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        }
      },
      required: ['query']
    },
    execute: async ({ query }) => {
      const results = contextManager.search(query);

      return {
        text: `═══════════════════════════════════════
        SEARCH RESULTS
        Query: "${query}"
═══════════════════════════════════════

${results.length === 0 ? 'No results found' :
  results.map(r => `
${r.type.toUpperCase()}
  Project: ${r.project}
  Match: ${r.match}
  ${r.document ? `Document: ${r.document}` : ''}
  ${r.task ? `Task: ${r.task}` : ''}
  ${r.note ? `Note: ${r.note}` : ''}
`).join('\n')}

───────────────────────────────────────
Total Results: ${results.length}
═══════════════════════════════════════`
      };
    }
  }
};

/**
 * Helper functions
 */

function extractActionItems(text) {
  const items = [];
  const patterns = [
    /(?:action item|todo|task)[:\s]+([^\n]+)/gi,
    /(?:need to|must|should|will)[:\s]+([^\n\.]+)/gi,
    /(?:please|kindly)[:\s]+([^\n\.]+)/gi
  ];

  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 10) {
        items.push(match[1].trim());
      }
    }
  });

  return [...new Set(items)];
}

function inferPriority(text) {
  const lowerText = text.toLowerCase();
  if (/urgent|asap|immediately|critical|emergency/i.test(lowerText)) {
    return 'urgent';
  }
  if (/important|priority|soon|this week/i.test(lowerText)) {
    return 'high';
  }
  if (/low priority|when possible|eventually/i.test(lowerText)) {
    return 'low';
  }
  return null;
}

function extractDeadline(text) {
  const datePatterns = [
    /by\s+(\d{4}-\d{2}-\d{2})/i,
    /due\s+(\d{4}-\d{2}-\d{2})/i,
    /deadline[:\s]+(\d{4}-\d{2}-\d{2})/i,
    /by\s+((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday))/i,
    /by\s+(today|tomorrow|next week)/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function extractAssignee(text) {
  // Try to extract person's name from text
  const namePattern = /(?:@|assigned to|owner:)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
  const match = text.match(namePattern);
  return match ? match[1] : null;
}

export default workflowTools;

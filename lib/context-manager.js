// ============================================
// CONTEXT MANAGER - Project Context & Memory
// ============================================

/**
 * Context store for maintaining project state
 */
class ContextManager {
  constructor() {
    this.projects = new Map();
    this.deadlines = [];
    this.activeIssues = [];
    this.recentActivity = [];
  }

  /**
   * Add or update project context
   */
  updateProject(projectId, data) {
    const existing = this.projects.get(projectId) || {
      id: projectId,
      created: new Date(),
      documents: [],
      tasks: [],
      risks: [],
      stakeholders: [],
      timeline: {},
      financials: {},
      notes: []
    };

    const updated = { ...existing, ...data, lastUpdated: new Date() };
    this.projects.set(projectId, updated);

    this.logActivity({
      type: 'project_update',
      projectId,
      timestamp: new Date(),
      summary: `Project ${projectId} updated`
    });

    return updated;
  }

  /**
   * Get project context
   */
  getProject(projectId) {
    return this.projects.get(projectId);
  }

  /**
   * Get all projects
   */
  getAllProjects() {
    return Array.from(this.projects.values());
  }

  /**
   * Add document to project
   */
  addDocument(projectId, document) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    project.documents.push({
      ...document,
      addedAt: new Date(),
      id: this.generateId()
    });

    this.updateProject(projectId, project);

    return project;
  }

  /**
   * Add task to project
   */
  addTask(projectId, task) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const newTask = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      status: task.status || 'pending'
    };

    project.tasks.push(newTask);
    this.updateProject(projectId, project);

    // Add to deadlines if task has deadline
    if (task.deadline) {
      this.addDeadline({
        ...newTask,
        projectId,
        project: project.name
      });
    }

    return newTask;
  }

  /**
   * Update task status
   */
  updateTaskStatus(projectId, taskId, status) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = status;
    task.updatedAt = new Date();

    this.updateProject(projectId, project);

    return task;
  }

  /**
   * Add risk to project
   */
  addRisk(projectId, risk) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const newRisk = {
      ...risk,
      id: this.generateId(),
      identifiedAt: new Date(),
      status: risk.status || 'active'
    };

    project.risks.push(newRisk);
    this.updateProject(projectId, project);

    // Add to active issues if high or critical
    if (risk.severity === 'high' || risk.severity === 'critical') {
      this.activeIssues.push({
        ...newRisk,
        projectId,
        project: project.name,
        type: 'risk'
      });
    }

    return newRisk;
  }

  /**
   * Add deadline
   */
  addDeadline(deadline) {
    const newDeadline = {
      ...deadline,
      id: deadline.id || this.generateId(),
      addedAt: new Date()
    };

    this.deadlines.push(newDeadline);

    return newDeadline;
  }

  /**
   * Get upcoming deadlines
   */
  getUpcomingDeadlines(daysAhead = 30) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return this.deadlines
      .filter(d => {
        const dueDate = new Date(d.date);
        return dueDate >= now && dueDate <= futureDate;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get overdue deadlines
   */
  getOverdueDeadlines() {
    const now = new Date();

    return this.deadlines
      .filter(d => {
        const dueDate = new Date(d.date);
        return dueDate < now && (!d.status || d.status !== 'completed');
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Get active issues
   */
  getActiveIssues() {
    return this.activeIssues.filter(i => i.status === 'active');
  }

  /**
   * Resolve issue
   */
  resolveIssue(issueId) {
    const issue = this.activeIssues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'resolved';
      issue.resolvedAt = new Date();
    }

    return issue;
  }

  /**
   * Add stakeholder to project
   */
  addStakeholder(projectId, stakeholder) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    project.stakeholders.push({
      ...stakeholder,
      addedAt: new Date()
    });

    this.updateProject(projectId, project);

    return project;
  }

  /**
   * Add note to project
   */
  addNote(projectId, note) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    project.notes.push({
      text: note,
      timestamp: new Date()
    });

    this.updateProject(projectId, project);

    return project;
  }

  /**
   * Log activity
   */
  logActivity(activity) {
    this.recentActivity.unshift(activity);

    // Keep only last 100 activities
    if (this.recentActivity.length > 100) {
      this.recentActivity = this.recentActivity.slice(0, 100);
    }
  }

  /**
   * Get recent activity
   */
  getRecentActivity(limit = 10) {
    return this.recentActivity.slice(0, limit);
  }

  /**
   * Search across projects
   */
  search(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    this.projects.forEach(project => {
      // Search project name
      if (project.name && project.name.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'project',
          project: project.name,
          projectId: project.id,
          match: 'Project name'
        });
      }

      // Search documents
      project.documents.forEach(doc => {
        if (doc.title && doc.title.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'document',
            project: project.name,
            projectId: project.id,
            document: doc.title,
            match: 'Document title'
          });
        }
      });

      // Search tasks
      project.tasks.forEach(task => {
        if (task.description && task.description.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'task',
            project: project.name,
            projectId: project.id,
            task: task.description,
            match: 'Task description'
          });
        }
      });

      // Search notes
      project.notes.forEach(note => {
        if (note.text && note.text.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'note',
            project: project.name,
            projectId: project.id,
            note: note.text.substring(0, 100),
            match: 'Note'
          });
        }
      });
    });

    return results;
  }

  /**
   * Generate project summary
   */
  getProjectSummary(projectId) {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    return {
      id: project.id,
      name: project.name,
      created: project.created,
      lastUpdated: project.lastUpdated,
      stats: {
        documents: project.documents.length,
        tasks: project.tasks.length,
        activeTasks: project.tasks.filter(t => t.status === 'pending').length,
        completedTasks: project.tasks.filter(t => t.status === 'completed').length,
        risks: project.risks.length,
        activeRisks: project.risks.filter(r => r.status === 'active').length,
        stakeholders: project.stakeholders.length
      },
      upcomingDeadlines: this.deadlines.filter(d => d.projectId === projectId).length
    };
  }

  /**
   * Generate dashboard data
   */
  getDashboard() {
    const totalProjects = this.projects.size;
    const totalTasks = this.getAllProjects().reduce((sum, p) => sum + p.tasks.length, 0);
    const activeTasks = this.getAllProjects().reduce(
      (sum, p) => sum + p.tasks.filter(t => t.status === 'pending').length,
      0
    );
    const totalRisks = this.getAllProjects().reduce((sum, p) => sum + p.risks.length, 0);
    const activeRisks = this.getAllProjects().reduce(
      (sum, p) => sum + p.risks.filter(r => r.status === 'active').length,
      0
    );

    return {
      projects: {
        total: totalProjects,
        list: this.getAllProjects().map(p => ({
          id: p.id,
          name: p.name,
          lastUpdated: p.lastUpdated
        }))
      },
      tasks: {
        total: totalTasks,
        active: activeTasks,
        completed: totalTasks - activeTasks
      },
      risks: {
        total: totalRisks,
        active: activeRisks
      },
      deadlines: {
        upcoming: this.getUpcomingDeadlines(7).length,
        overdue: this.getOverdueDeadlines().length
      },
      recentActivity: this.getRecentActivity(5)
    };
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all context (for testing)
   */
  clear() {
    this.projects.clear();
    this.deadlines = [];
    this.activeIssues = [];
    this.recentActivity = [];
  }
}

// Create singleton instance
export const contextManager = new ContextManager();

export default ContextManager;

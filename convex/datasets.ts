import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";

const DEMO_PREFIX = "demo:tfaagency";

type DemoWorkspace = {
  slug: string;
  name: string;
  color: string;
  projects: DemoProject[];
};

type DemoProject = {
  slug: string;
  name: string;
  description: string;
  status: "active" | "completed" | "onHold";
  progress: number;
  favorite: boolean;
  color: string;
  dueDate?: string;
  tags: string[];
  members: string[];
  milestones: Array<{
    id: string;
    title: string;
    date: string;
    completed: boolean;
  }>;
  tasks: DemoTask[];
};

type DemoTask = {
  slug: string;
  title: string;
  description: string;
  status: "backlog" | "todo" | "inProgress" | "inReview" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  tags: string[];
  subtasks: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
};

async function resolveSeedUserId(ctx: MutationCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (userId !== null) {
    return userId;
  }

  const users = await ctx.db.query("users").take(2);
  if (users.length === 1) {
    return users[0]._id;
  }

  throw new Error(
    "Seed requires an authenticated user or a database with exactly one user record.",
  );
}

function buildLegacyId(...parts: string[]) {
  return `${DEMO_PREFIX}:${parts.join(":")}`;
}

function isDemoRecord(record: { legacySupabaseId?: string | undefined }) {
  return record.legacySupabaseId?.startsWith(DEMO_PREFIX) ?? false;
}

async function clearExistingDemoData(ctx: MutationCtx, userId: Id<"users">) {
  const [activities, tasks, projects, workspaces] = await Promise.all([
    ctx.db.query("activities").withIndex("userId", (q) => q.eq("userId", userId)).collect(),
    ctx.db.query("tasks").withIndex("ownerId", (q) => q.eq("ownerId", userId)).collect(),
    ctx.db.query("projects").withIndex("ownerId", (q) => q.eq("ownerId", userId)).collect(),
    ctx.db.query("workspaces").withIndex("ownerId", (q) => q.eq("ownerId", userId)).collect(),
  ]);

  for (const activity of activities.filter(isDemoRecord)) {
    await ctx.db.delete(activity._id);
  }

  for (const task of tasks.filter(isDemoRecord)) {
    await ctx.db.delete(task._id);
  }

  for (const project of projects.filter(isDemoRecord)) {
    await ctx.db.delete(project._id);
  }

  for (const workspace of workspaces.filter(isDemoRecord)) {
    await ctx.db.delete(workspace._id);
  }
}

function buildDemoDataset(): DemoWorkspace[] {
  return [
    {
      slug: "northstar-health",
      name: "TFAAgency / Northstar Health",
      color: "#0f766e",
      projects: [
        {
          slug: "patient-portal-relaunch",
          name: "Patient Portal Relaunch",
          description:
            "Redesign the patient experience across appointment booking, secure messaging, and billing handoff before the board preview.",
          status: "active",
          progress: 72,
          favorite: true,
          color: "#14b8a6",
          dueDate: "2026-07-18",
          tags: ["web", "ux", "healthcare", "phase-2"],
          members: ["Ava Patel", "Jonah Reed", "Mia Chen"],
          milestones: [
            { id: "m1", title: "Discovery sign-off", date: "2026-05-20", completed: true },
            { id: "m2", title: "Interactive prototype", date: "2026-06-24", completed: true },
            { id: "m3", title: "Stakeholder review", date: "2026-07-10", completed: false },
          ],
          tasks: [
            {
              slug: "finalize-mobile-nav",
              title: "Finalize mobile navigation states",
              description: "Ship the revised mobile nav states for booking, messages, and billing flows.",
              status: "inReview",
              priority: "high",
              dueDate: "2026-06-18",
              tags: ["design", "frontend", "mobile"],
              subtasks: [
                { id: "s1", title: "Validate tap targets", completed: true },
                { id: "s2", title: "QA iPhone Safari", completed: true },
                { id: "s3", title: "Capture review notes", completed: false },
              ],
            },
            {
              slug: "copy-migration",
              title: "Migrate portal microcopy",
              description: "Replace legacy appointment and billing copy with approved patient-friendly language.",
              status: "todo",
              priority: "medium",
              dueDate: "2026-06-21",
              tags: ["content", "compliance"],
              subtasks: [
                { id: "s1", title: "Export old copy deck", completed: true },
                { id: "s2", title: "Map approved language", completed: false },
              ],
            },
            {
              slug: "billing-alerts",
              title: "Implement billing reminder alerts",
              description: "Add proactive reminder states before unpaid invoices hit collections.",
              status: "inProgress",
              priority: "urgent",
              dueDate: "2026-06-17",
              tags: ["billing", "automation", "alerts"],
              subtasks: [
                { id: "s1", title: "Define reminder schedule", completed: true },
                { id: "s2", title: "Connect trigger copy", completed: false },
                { id: "s3", title: "Verify QA sandbox", completed: false },
              ],
            },
            {
              slug: "a11y-audit",
              title: "Accessibility audit for patient dashboard",
              description: "Audit color contrast, keyboard flow, and focus management before handoff.",
              status: "done",
              priority: "high",
              dueDate: "2026-06-09",
              tags: ["a11y", "qa"],
              subtasks: [
                { id: "s1", title: "Run screen reader pass", completed: true },
                { id: "s2", title: "Log remediation items", completed: true },
              ],
            },
          ],
        },
        {
          slug: "crm-followup-automation",
          name: "CRM Follow-up Automation",
          description:
            "Set up post-visit nurture journeys so Northstar can reduce manual outreach from care coordinators.",
          status: "active",
          progress: 48,
          favorite: false,
          color: "#0ea5e9",
          dueDate: "2026-08-02",
          tags: ["crm", "automation", "lifecycle"],
          members: ["Jonah Reed", "Selena Brooks"],
          milestones: [
            { id: "m1", title: "Segment strategy", date: "2026-06-12", completed: true },
            { id: "m2", title: "Journey mapping", date: "2026-06-28", completed: false },
            { id: "m3", title: "Launch checklist", date: "2026-07-30", completed: false },
          ],
          tasks: [
            {
              slug: "segment-high-risk",
              title: "Build high-risk patient segment rules",
              description: "Define lifecycle criteria for high-risk patient follow-up and escalation paths.",
              status: "inProgress",
              priority: "high",
              dueDate: "2026-06-20",
              tags: ["segmentation", "crm"],
              subtasks: [
                { id: "s1", title: "Align with care ops", completed: true },
                { id: "s2", title: "Draft segment filters", completed: false },
              ],
            },
            {
              slug: "sms-approval",
              title: "Collect SMS consent approval copy",
              description: "Lock the consent copy required for automated follow-up texts.",
              status: "backlog",
              priority: "medium",
              tags: ["legal", "sms"],
              subtasks: [
                { id: "s1", title: "Request legal review", completed: false },
              ],
            },
            {
              slug: "reengagement-email",
              title: "Design re-engagement email series",
              description: "Create a three-touch sequence for patients who miss scheduled follow-up appointments.",
              status: "todo",
              priority: "medium",
              dueDate: "2026-06-27",
              tags: ["email", "automation"],
              subtasks: [
                { id: "s1", title: "Outline three-message arc", completed: true },
                { id: "s2", title: "Add performance hypotheses", completed: false },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "atlas-commerce",
      name: "TFAAgency / Atlas Commerce",
      color: "#7c3aed",
      projects: [
        {
          slug: "summer-drop-campaign",
          name: "Summer Drop Campaign",
          description:
            "Coordinate creative, email, social, and landing page delivery for Atlas Commerce's July product launch.",
          status: "active",
          progress: 61,
          favorite: true,
          color: "#8b5cf6",
          dueDate: "2026-07-05",
          tags: ["campaign", "launch", "ecommerce"],
          members: ["Ava Patel", "Rico Mendez", "Lena Ward"],
          milestones: [
            { id: "m1", title: "Campaign concept", date: "2026-06-05", completed: true },
            { id: "m2", title: "Asset lock", date: "2026-06-22", completed: false },
            { id: "m3", title: "Launch day runbook", date: "2026-07-03", completed: false },
          ],
          tasks: [
            {
              slug: "landing-page-qa",
              title: "QA launch landing page",
              description: "Verify variant modules, promo timing, and mobile merchandising blocks.",
              status: "inReview",
              priority: "urgent",
              dueDate: "2026-06-19",
              tags: ["qa", "web", "launch"],
              subtasks: [
                { id: "s1", title: "Test promo banner timing", completed: true },
                { id: "s2", title: "Verify mobile stacking", completed: false },
                { id: "s3", title: "Approve final screenshots", completed: false },
              ],
            },
            {
              slug: "creator-briefs",
              title: "Send creator briefing packs",
              description: "Distribute approved hooks, posting windows, and tracking links to creator partners.",
              status: "todo",
              priority: "high",
              dueDate: "2026-06-20",
              tags: ["influencer", "ops"],
              subtasks: [
                { id: "s1", title: "Generate UTM links", completed: true },
                { id: "s2", title: "Export partner roster", completed: false },
              ],
            },
            {
              slug: "sku-bundle-report",
              title: "Prepare bundle profitability report",
              description: "Model expected margin performance for the hero bundle and add launch notes.",
              status: "done",
              priority: "medium",
              dueDate: "2026-06-10",
              tags: ["reporting", "finance"],
              subtasks: [
                { id: "s1", title: "Validate margin inputs", completed: true },
                { id: "s2", title: "Share with merchandising", completed: true },
              ],
            },
            {
              slug: "ugc-backup-plan",
              title: "Create UGC backup plan",
              description: "Line up fallback assets in case launch-day creator deliverables arrive late.",
              status: "backlog",
              priority: "low",
              tags: ["creative", "risk"],
              subtasks: [
                { id: "s1", title: "List backup asset sources", completed: false },
              ],
            },
          ],
        },
        {
          slug: "returns-experience-refresh",
          name: "Returns Experience Refresh",
          description:
            "Reduce support tickets by improving the returns flow, status emails, and help center content.",
          status: "onHold",
          progress: 29,
          favorite: false,
          color: "#ec4899",
          dueDate: "2026-08-15",
          tags: ["cx", "returns", "support"],
          members: ["Mia Chen", "Lena Ward"],
          milestones: [
            { id: "m1", title: "Returns audit", date: "2026-06-08", completed: true },
            { id: "m2", title: "Support policy sign-off", date: "2026-06-30", completed: false },
          ],
          tasks: [
            {
              slug: "decision-tree",
              title: "Draft returns decision tree",
              description: "Map damaged, sizing, and delayed-order returns into a single support flow.",
              status: "todo",
              priority: "medium",
              dueDate: "2026-06-25",
              tags: ["cx", "workflow"],
              subtasks: [
                { id: "s1", title: "Review current macros", completed: true },
                { id: "s2", title: "Draft exception paths", completed: false },
              ],
            },
            {
              slug: "hold-note",
              title: "Document hold reason and restart criteria",
              description: "Capture what Atlas needs approved before the refresh can restart.",
              status: "done",
              priority: "low",
              dueDate: "2026-06-14",
              tags: ["stakeholders"],
              subtasks: [
                { id: "s1", title: "Summarize budget constraint", completed: true },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: "harbor-capital",
      name: "TFAAgency / Harbor Capital",
      color: "#ea580c",
      projects: [
        {
          slug: "investor-portal-analytics",
          name: "Investor Portal Analytics",
          description:
            "Stand up executive dashboards and reporting layers for Harbor's quarterly investor communications.",
          status: "active",
          progress: 83,
          favorite: true,
          color: "#f97316",
          dueDate: "2026-06-28",
          tags: ["analytics", "dashboard", "finance"],
          members: ["Rico Mendez", "Selena Brooks", "Jonah Reed"],
          milestones: [
            { id: "m1", title: "Data source audit", date: "2026-05-28", completed: true },
            { id: "m2", title: "Board dashboard beta", date: "2026-06-16", completed: true },
            { id: "m3", title: "Quarter-close package", date: "2026-06-26", completed: false },
          ],
          tasks: [
            {
              slug: "kpi-anomaly-check",
              title: "Review KPI anomaly flags",
              description: "Validate outliers in portfolio company CAC and margin trend lines.",
              status: "inProgress",
              priority: "urgent",
              dueDate: "2026-06-16",
              tags: ["analytics", "qa"],
              subtasks: [
                { id: "s1", title: "Confirm source extracts", completed: true },
                { id: "s2", title: "Annotate anomalies", completed: false },
              ],
            },
            {
              slug: "exec-summary",
              title: "Write quarterly executive summary",
              description: "Translate dashboard findings into a concise board-ready narrative.",
              status: "todo",
              priority: "high",
              dueDate: "2026-06-22",
              tags: ["reporting", "exec"],
              subtasks: [
                { id: "s1", title: "Outline headline insights", completed: true },
                { id: "s2", title: "Add risk callouts", completed: false },
              ],
            },
            {
              slug: "board-deck-sync",
              title: "Sync metrics into board deck",
              description: "Push locked KPIs into the investor update deck and verify commentary alignment.",
              status: "done",
              priority: "medium",
              dueDate: "2026-06-12",
              tags: ["deck", "ops"],
              subtasks: [
                { id: "s1", title: "Refresh KPI exports", completed: true },
                { id: "s2", title: "Validate slide notes", completed: true },
              ],
            },
          ],
        },
        {
          slug: "thought-leadership-pipeline",
          name: "Thought Leadership Pipeline",
          description:
            "Build a repeatable content engine for partner viewpoints, deal commentary, and newsletter distribution.",
          status: "completed",
          progress: 100,
          favorite: false,
          color: "#fb923c",
          dueDate: "2026-06-01",
          tags: ["content", "newsletter", "brand"],
          members: ["Ava Patel", "Selena Brooks"],
          milestones: [
            { id: "m1", title: "Editorial calendar", date: "2026-05-06", completed: true },
            { id: "m2", title: "First three essays live", date: "2026-05-26", completed: true },
          ],
          tasks: [
            {
              slug: "newsletter-template",
              title: "Finalize newsletter template",
              description: "Complete the reusable newsletter module library for partner communications.",
              status: "done",
              priority: "medium",
              dueDate: "2026-05-18",
              tags: ["email", "template"],
              subtasks: [
                { id: "s1", title: "Approve typography scale", completed: true },
                { id: "s2", title: "Test Outlook fallback", completed: true },
              ],
            },
            {
              slug: "deal-commentary-workflow",
              title: "Document deal commentary workflow",
              description: "Capture approvals and publishing steps for future partner commentary pieces.",
              status: "done",
              priority: "low",
              dueDate: "2026-05-28",
              tags: ["process", "documentation"],
              subtasks: [
                { id: "s1", title: "Publish internal SOP", completed: true },
              ],
            },
          ],
        },
      ],
    },
  ];
}

async function insertActivitiesForSeed(
  ctx: MutationCtx,
  userId: Id<"users">,
  createdProjects: Array<{ id: Id<"projects">; project: DemoProject }>,
  createdTasks: Array<{ id: Id<"tasks">; task: DemoTask; projectId: Id<"projects"> }>,
) {
  const activityPayloads: Array<{
    legacySupabaseId: string;
    userId: Id<"users">;
    action: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    metadata?: {
      projectId?: string;
      taskId?: string;
    };
  }> = [];

  for (const { id, project } of createdProjects) {
    activityPayloads.push({
      legacySupabaseId: buildLegacyId("activity", "project", project.slug),
      userId,
      action: project.status === "completed" ? "completed" : "created",
      entityType: "project",
      entityId: String(id),
      entityName: project.name,
      metadata: { projectId: String(id) },
    });
  }

  for (const { id, task, projectId } of createdTasks.slice(0, 12)) {
    activityPayloads.push({
      legacySupabaseId: buildLegacyId("activity", "task", task.slug),
      userId,
      action: task.status === "done" ? "completed task" : "updated task",
      entityType: "task",
      entityId: String(id),
      entityName: task.title,
      metadata: { projectId: String(projectId), taskId: String(id) },
    });
  }

  for (const activity of activityPayloads) {
    await ctx.db.insert("activities", activity);
  }
}

export const seedFixtures = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await resolveSeedUserId(ctx);
    await clearExistingDemoData(ctx, userId);

    const dataset = buildDemoDataset();
    const createdProjects: Array<{ id: Id<"projects">; project: DemoProject }> = [];
    const createdTasks: Array<{ id: Id<"tasks">; task: DemoTask; projectId: Id<"projects"> }> = [];

    for (const workspace of dataset) {
      const workspaceId = await ctx.db.insert("workspaces", {
        legacySupabaseId: buildLegacyId("workspace", workspace.slug),
        ownerId: userId,
        name: workspace.name,
        color: workspace.color,
      });

      for (const project of workspace.projects) {
        const projectId = await ctx.db.insert("projects", {
          legacySupabaseId: buildLegacyId("project", workspace.slug, project.slug),
          ownerId: userId,
          workspaceId,
          name: project.name,
          description: project.description,
          dueDate: project.dueDate,
          status: project.status,
          progress: project.progress,
          members: project.members,
          favorite: project.favorite,
          color: project.color,
          tags: [...project.tags, "demo", "tfaagency"],
          milestones: project.milestones,
        });

        createdProjects.push({ id: projectId, project });

        for (const task of project.tasks) {
          const taskId = await ctx.db.insert("tasks", {
            legacySupabaseId: buildLegacyId("task", workspace.slug, project.slug, task.slug),
            ownerId: userId,
            projectId,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assigneeId: userId,
            dueDate: task.dueDate,
            tags: [...task.tags, workspace.slug, "demo"],
            subtasks: task.subtasks,
          });

          createdTasks.push({ id: taskId, task, projectId });
        }
      }
    }

    await insertActivitiesForSeed(ctx, userId, createdProjects, createdTasks);

    return {
      workspaceCount: dataset.length,
      projectCount: createdProjects.length,
      taskCount: createdTasks.length,
      activityCount: Math.min(createdTasks.length, 12) + createdProjects.length,
      demoPrefix: DEMO_PREFIX,
    };
  },
});

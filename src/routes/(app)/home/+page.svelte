<script lang="ts">
    import type { PageData } from "./$types";
    import TaskChecklist from "$lib/components/TaskChecklist.svelte";
    import VisibilityMeter from "$lib/components/VisibilityMeter.svelte";
    import ProgressionDisplay from "$lib/components/ProgressionDisplay.svelte";

    let { data }: { data: PageData } = $props();

    let greeting = $derived(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    });

    let sortedProjects = $derived(
        (data.projects || [])
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );

    let mainProject = $derived(sortedProjects[0] || null);

    let recentProjects = $derived(sortedProjects.slice(0, 3));

    const announcements = [
        {
            id: 1,
            title: "Welcome to BuildBoard!",
            content: "Track your coding hours, manage projects, and get your projects out there!",
            level: "primary",
            cta: { text: "Learn More About Hack Club", url: "https://hackclub.com" }
        }
    ];

    let dismissedAnnouncements = $state<number[]>([]);

    // Load dismissed announcements from localStorage on mount
    $effect(() => {
        const stored = localStorage.getItem('dismissedAnnouncements');
        if (stored) {
            dismissedAnnouncements = JSON.parse(stored);
        }
    });

    function dismissAnnouncement(id: number) {
        dismissedAnnouncements = [...dismissedAnnouncements, id];
        localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedAnnouncements));
    }

    function formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    }

    let totalTime = $derived(
        (data.projects || []).reduce((acc: number, p: any) => acc + (p.time_spent || 0), 0)
    );
</script>

<div class="home-page">
    <!-- Announcement Bar -->
    {#each announcements.filter(a => !dismissedAnnouncements.includes(a.id)) as announcement}
        <div class="announcement announcement-{announcement.level}">
            <div class="announcement-content">
                <span class="announcement-title">{announcement.title}</span>
                <span class="announcement-text">{announcement.content}</span>
                {#if announcement.cta}
                    <a href={announcement.cta.url} class="announcement-cta" target="_blank" rel="noopener">
                        {announcement.cta.text}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                {/if}
            </div>
            <button class="announcement-dismiss" onclick={() => dismissAnnouncement(announcement.id)} aria-label="Dismiss announcement">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>
    {/each}

    <!-- Header -->
    <header class="page-header">
        <div class="greeting">
            <h1>{greeting()}, {data.user?.profile?.first_name || data.user?.handle || 'Builder'}!</h1>
            <p class="subtitle">Here's what's happening with your projects</p>
        </div>
    </header>

    <!-- Visibility Meter -->
    <div class="visibility-section">
        <VisibilityMeter visibility={data.visibility} hasProjects={(data.projects?.length || 0) > 0} projectId={mainProject?.project_id} />
    </div>

    <!-- Progression Display -->
    <div class="progression-section mt-7">
        <ProgressionDisplay minutes={data.minutes} />
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid">
        <!-- Tasks Section -->
        <section class="section-card tasks-section">
            <TaskChecklist projects={data.projects} />
        </section>

        <!-- Projects Section -->
        <section class="section-card projects-section">
            <div class="section-header">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                    Recent Projects
                </h2>
                <a href="/projects" class="view-all">View All →</a>
            </div>

            {#if recentProjects.length === 0}
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                    </div>
                    <p>No projects yet</p>
                    <a href="/projects/select" class="empty-cta">Start your first project</a>
                </div>
            {:else}
                <div class="projects-list">
                    {#each recentProjects as project}
                        <a href="/projects/{project.project_id}" class="project-item">
                            <div class="project-icon">
                                
                            </div>
                            <div class="project-details">
                                <h3>{project.project_name}</h3>
                                <div class="project-meta">
                                    <span class="time">{formatTime(project.time_spent)}</span>
                                    <span class="divider">•</span>
                                    <span class="week">Week {project.submission_week}</span>
                                </div>
                            </div>
                            <svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </a>
                    {/each}
                </div>
                <a href="/projects/select" class="new-project-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Project
                </a>
            {/if}
        </section>

    </div>
</div>

<style>
    .home-page {
        max-width: 1000px;
        margin: 0 auto;
        padding: 0 1rem 2rem;
    }

    /* Announcement Bar */
    .announcement {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1.25rem;
        border-radius: 0;
        margin-bottom: 1.5rem;
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .announcement-primary {
        background: rgba(109, 46, 43, 0.9);
    }

    .announcement-warning {
        background: #b45309;
    }

    .announcement-success {
        background: #15803d;
    }

    .announcement-danger {
        background: #991b1b;
    }

    .announcement-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .announcement-title {
        font-weight: 700;
        font-size: 0.95rem;
    }

    .announcement-text {
        font-size: 0.9rem;
        opacity: 0.9;
    }

    .announcement-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: inherit;
        text-decoration: none;
        padding: 0.35rem 0.75rem;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 0;
        transition: background 0.2s;
    }

    .announcement-cta:hover {
        background: rgba(255, 255, 255, 0.25);
    }

    .announcement-dismiss {
        background: none;
        border: none;
        color: inherit;
        opacity: 0.6;
        cursor: pointer;
        padding: 0.25rem;
        transition: opacity 0.2s;
    }

    .announcement-dismiss:hover {
        opacity: 1;
    }

    /* Header */
    .page-header {
        margin-bottom: 1.5rem;
    }

    .greeting h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.35rem;
    }

    .subtitle {
        color: var(--bb-text-muted);
        margin: 0;
        font-size: 0.95rem;
    }

    .progression-section {
        margin-bottom: 1.5rem;
    }

    /* Stats Bar */
    .stats-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .stat-pill {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: rgba(46, 34, 33, 0.95);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
        color: var(--bb-text-primary);
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .stat-pill svg {
        opacity: 0.7;
        color: var(--bb-primary);
    }

    .stat-value {
        font-weight: 700;
        font-size: 1rem;
        color: var(--bb-primary);
    }

    .stat-label {
        font-size: 0.8rem;
        opacity: 0.7;
    }

    /* Dashboard Grid */
    .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
    }

    /* Section Cards */
    .section-card {
        background: linear-gradient(165deg, rgba(46, 34, 33, 0.95) 0%, rgba(35, 25, 24, 0.95) 100%);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
        padding: 1.25rem;
        box-shadow: 
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    .section-card h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        margin: 0;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .view-all {
        font-size: 0.8rem;
        color: var(--bb-primary);
        text-decoration: none;
    }

    .view-all:hover {
        text-decoration: underline;
    }

    /* Tasks Section */
    .tasks-section {
        grid-column: 1 / -1;
        background: transparent;
        border: none;
        padding: 0;
        box-shadow: none;
    }

    /* Projects Section */
    .projects-section {
        grid-column: 1 / -1;
    }

    .projects-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }

    .project-item {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        padding: 0.875rem 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid transparent;
        border-radius: 0;
        text-decoration: none;
        transition: all 0.2s;
    }

    .project-item:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: var(--bb-accent-dark);
        transform: translateX(4px);
    }

    .project-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(109, 46, 43, 0.4);
        border-radius: 0;
        font-size: 1.25rem;
    }

    .project-details {
        flex: 1;
        min-width: 0;
    }

    .project-details h3 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        margin: 0 0 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .project-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: var(--bb-text-muted);
    }

    .divider {
        opacity: 0.4;
    }

    .arrow {
        color: var(--bb-text-muted);
        transition: all 0.2s;
    }

    .project-item:hover .arrow {
        color: var(--bb-primary);
        transform: translateX(2px);
    }

    .new-project-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem;
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 0.9rem;
        border-radius: 0;
        text-decoration: none;
        transition: all 0.2s;
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .new-project-btn:hover {
        transform: translateY(-2px);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
    }

    /* Empty State */
    .empty-state {
        text-align: center;
        padding: 2rem 1rem;
        color: var(--bb-text-muted);
    }

    .empty-icon {
        margin-bottom: 0.75rem;
        opacity: 0.4;
    }

    .empty-state p {
        margin: 0 0 0.75rem;
        font-size: 0.95rem;
    }

    .empty-cta {
        display: inline-flex;
        padding: 0.5rem 1rem;
        background: var(--bb-primary);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 0.85rem;
        border-radius: 0;
        text-decoration: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .dashboard-grid {
            grid-template-columns: 1fr;
        }

        .greeting h1 {
            font-size: 1.35rem;
        }

        .stats-bar {
            flex-wrap: wrap;
        }

        .announcement-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
    }
</style>

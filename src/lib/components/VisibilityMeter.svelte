<script lang="ts">
    interface VisibilityMilestone {
        id: string;
        name: string;
        description: string;
        completed: boolean;
        level: number;
    }

    interface VisibilityStatus {
        current_level: number;
        current_level_name: string;
        next_level: number | null;
        next_level_name: string | null;
        progress_percentage: number;
        milestones: VisibilityMilestone[];
        total_completed: number;
        total_milestones: number;
    }

    interface Props {
        visibility: VisibilityStatus;
        hasProjects?: boolean;
        projectId?: string | null;
    }

    let { visibility, hasProjects = false, projectId = null }: Props = $props();

    function getMilestoneHref(milestoneId: string): string | null {
        if (!projectId) return null;
        
        switch (milestoneId) {
            case 'github':
            case 'hackatime':
                return `/projects/${projectId}#${milestoneId}`;
            case 'shipped':
            case 'approved':
                return `/projects/${projectId}`;
            default:
                return null;
        }
    }

    const levelNames: Record<number, string> = {
        1: 'Hidden',
        2: 'Local',
        3: 'Community',
        4: 'Featured',
        5: 'Billboard'
    };

    let nextLevelRequirements = $derived(
        visibility.next_level 
            ? visibility.milestones.filter(m => m.level === visibility.next_level)
            : []
    );
</script>

<div class="visibility-card">
    <div class="card-header">
        <h2>Visibility Progress</h2>
        <span class="level-badge" class:level-max={visibility.current_level === 5}>
            {visibility.current_level_name}
        </span>
    </div>

    <div class="progress-section">
        <div class="progress-labels">
            <span class="progress-current">Level {visibility.current_level}</span>
            <span class="progress-percent">{visibility.progress_percentage}%</span>
        </div>
        <div 
            class="progress-track"
            role="progressbar"
            aria-label="Visibility progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={visibility.progress_percentage}
        >
            <div 
                class="progress-fill"
                style="width: {visibility.progress_percentage}%"
            ></div>
            <div class="progress-markers">
                {#each [1, 2, 3, 4, 5] as level}
                    <div 
                        class="marker"
                        class:completed={visibility.current_level >= level}
                        class:current={visibility.current_level === level}
                        style="left: {(level - 1) * 25}%"
                        title={levelNames[level]}
                    >
                        <span class="marker-label">{levelNames[level]}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    {#if !hasProjects}
        <div class="milestones-section">
            <h3>Get Started</h3>
            <ul class="milestones-list">
                <li class="milestone">
                    <div class="milestone-indicator">
                        <span class="milestone-number">1</span>
                    </div>
                    <div class="milestone-content">
                        <span class="milestone-name">Create a Project</span>
                        <span class="milestone-desc">Start by creating your first project to begin tracking progress</span>
                    </div>
                </li>
            </ul>
            <a href="/projects/select" class="create-project-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Create Project
            </a>
        </div>
    {:else if visibility.next_level_name}
        <div class="milestones-section">
            <h3>To reach {visibility.next_level_name}</h3>
            <ul class="milestones-list">
                {#each nextLevelRequirements as milestone, i}
                    {@const href = getMilestoneHref(milestone.id)}
                    {#if href && !milestone.completed}
                        <a href={href} class="milestone clickable" class:done={milestone.completed}>
                            <div class="milestone-indicator">
                                <span class="milestone-number">{i + 1}</span>
                            </div>
                            <div class="milestone-content">
                                <span class="milestone-name">{milestone.name}</span>
                                <span class="milestone-desc">{milestone.description}</span>
                            </div>
                            <svg class="milestone-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </a>
                    {:else}
                        <li class="milestone" class:done={milestone.completed}>
                            <div class="milestone-indicator">
                                {#if milestone.completed}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                {:else}
                                    <span class="milestone-number">{i + 1}</span>
                                {/if}
                            </div>
                            <div class="milestone-content">
                                <span class="milestone-name">{milestone.name}</span>
                                <span class="milestone-desc">{milestone.description}</span>
                            </div>
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
    {:else}
        <div class="next-hint max-reached">
            🎉 Maximum visibility reached!
        </div>
    {/if}
</div>

<style>
    .visibility-card {
        background-color: var(--bb-bg-dark);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
        padding: 1.5rem 2rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .card-header h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0;
    }

    .level-badge {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.375rem 0.75rem;
        border-radius: 0;
        background-color: var(--bb-accent-dark);
        color: var(--bb-text-primary);
    }

    .level-badge.level-max {
        background-color: var(--bb-accent);
        color: white;
    }

    .progress-section {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .progress-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: var(--bb-text-muted);
    }

    .progress-percent {
        font-weight: 600;
        color: var(--bb-primary);
    }

    .progress-track {
        position: relative;
        height: 1rem;
        background-color: var(--bb-accent-dark);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0;
        overflow: visible;
    }

    .progress-fill {
        height: 100%;
        background-color: var(--bb-accent);
        background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 0 2px,
            transparent 2px 8px
        );
        background-blend-mode: overlay;
        transition: width 0.4s ease-out;
        border-radius: 0;
    }

    .progress-markers {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        pointer-events: none;
    }

    .marker {
        position: absolute;
        top: 50%;
        width: 10px;
        height: 10px;
        background-color: var(--bb-bg-dark);
        border: 2px solid var(--bb-accent-dark);
        border-radius: 0;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
    }

    .marker.completed {
        background-color: var(--bb-accent);
        border-color: var(--bb-accent);
    }

    .marker.current {
        box-shadow: 0 0 0 3px rgba(206, 51, 55, 0.4);
    }

    .marker-label {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 0.5rem;
        font-size: 0.625rem;
        font-weight: 500;
        color: var(--bb-text-muted);
        white-space: nowrap;
        display: none;
    }

    @media (min-width: 640px) {
        .marker-label {
            display: block;
        }
    }

    .milestones-section {
        padding-top: 0.5rem;
    }

    .milestones-section h3 {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--bb-text-muted);
        margin: 0 0 0.75rem;
    }

    .milestones-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .milestone {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.625rem 0.875rem;
        background-color: rgba(255, 255, 255, 0.03);
        border-radius: 0;
        border: 1px solid var(--bb-accent-dark);
        text-decoration: none;
    }

    .milestone.clickable {
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .milestone.clickable:hover {
        background-color: rgba(255, 255, 255, 0.08);
        border-color: var(--bb-primary);
        transform: translateX(4px);
    }

    .milestone-arrow {
        flex-shrink: 0;
        align-self: center;
        color: var(--bb-text-muted);
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .milestone.clickable:hover .milestone-arrow {
        opacity: 1;
        color: var(--bb-primary);
    }

    .milestone-indicator {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0;
        background-color: var(--bb-accent);
        color: white;
    }

    .milestone.done .milestone-indicator {
        background-color: #22c55e;
    }

    .milestone-number {
        font-size: 0.75rem;
        font-weight: 700;
    }

    .milestone-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
    }

    .milestone-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--bb-text-primary);
    }

    .milestone-desc {
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    .next-hint {
        text-align: center;
        font-size: 0.875rem;
        color: var(--bb-text-muted);
        padding-top: 0.5rem;
        border-top: 1px solid var(--bb-accent-dark);
    }

    .next-hint strong {
        color: var(--bb-primary);
    }

    .next-hint.max-reached {
        color: var(--bb-accent);
    }

    .create-project-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding: 0.75rem 1.25rem;
        background-color: var(--bb-accent);
        color: white;
        font-weight: 600;
        font-size: 0.9rem;
        border-radius: 0;
        text-decoration: none;
        transition: background-color 0.2s, transform 0.2s;
    }

    .create-project-btn:hover {
        background-color: #b52a2e;
        transform: translateY(-1px);
    }

    @media (max-width: 640px) {
        .visibility-card {
            padding: 1.25rem;
        }

        .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .progress-track {
            margin-bottom: 0.5rem;
        }
    }
</style>

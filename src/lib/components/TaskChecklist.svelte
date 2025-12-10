<script lang="ts">
    import { getUser, updateUser, hasRole } from '$lib/state/user.svelte';
    import type { User } from '$lib/state/user.svelte';

    interface Props {
        projects?: any[];
    }

    let { projects = [] }: Props = $props();

    let user = $derived(getUser());

    // UI state
    let slackLoading = $state(false);

    function isSlackMember(u: User | null): boolean {
        if (!u) return false;
        return !!u.slack_linked_at || hasRole(u, 'slack_member');
    }

    function hasProject(projectList: any[]): boolean {
        return projectList && projectList.length > 0;
    }

    function isIdvComplete(u: User | null): boolean {
        if (!u) return false;
        return !!u.idv_completed_at || hasRole(u, 'idv');
    }

    function isOnboardingComplete(u: User | null): boolean {
        if (!u) return false;
        return !!u.onboarding_completed_at;
    }

    let tasks = $derived([
        {
            id: 'slack',
            label: 'Join the Hack Club Slack',
            complete: isSlackMember(user),
        },
        {
            id: 'project',
            label: 'Start your first project',
            complete: hasProject(projects),
            action: '/projects/select',
        },
        {
            id: 'idv',
            label: 'Verify your identity',
            complete: isIdvComplete(user),
            action: '/auth/idv/start?returnTo=/home',
        }
    ]);

    let allComplete = $derived(tasks.every(t => t.complete));
    let onboardingComplete = $derived(isOnboardingComplete(user));

    async function markOnboardingComplete() {
        if (user && allComplete && !onboardingComplete) {
            await fetch(`/api/users/${user.user_id}/onboarding-complete`, {
                method: 'POST'
            });
            await updateUser();
        }
    }

    $effect(() => {
        if (allComplete && !onboardingComplete) {
            markOnboardingComplete();
        }
    });

    async function handleSlackJoin() {
        if (!user || slackLoading) return;
        
        slackLoading = true;
        
        // Open Slack invite in new tab
        window.open('https://hackclub.com/slack', '_blank');
        
        // Mark as complete (trusting the user)
        try {
            const response = await fetch(`/api/users/${user.user_id}/slack-complete`, {
                method: 'POST'
            });
            
            if (response.ok) {
                await updateUser();
            }
        } catch (error) {
            console.error('Failed to mark Slack complete:', error);
        } finally {
            slackLoading = false;
        }
    }
</script>

{#if !onboardingComplete}
    <div class="task-card">
        <div class="card-header">
            <h2>Your tasks</h2>
            <p class="subtext">Complete these to get started!</p>
        </div>

        <div class="tasks-container">
            <div class="tasks-list">
                {#each tasks as task}
                    <div class="task-item">
                        <div class="checkbox" class:checked={task.complete}></div>
                        {#if task.complete}
                            <p class="task-label completed">{task.label}</p>
                        {:else if task.id === 'slack'}
                            <button
                                type="button"
                                class="task-label link"
                                onclick={handleSlackJoin}
                                disabled={slackLoading}
                            >
                                {slackLoading ? 'Opening Slack...' : task.label}
                            </button>
                        {:else}
                            <a
                                href={task.action}
                                class="task-label link"
                            >
                                {task.label}
                            </a>
                        {/if}
                    </div>
                {/each}
            </div>

            {#if allComplete}
                <div class="cta-section">
                    <p class="cta-text">🎉 You're all set!</p>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .task-card {
        background: #a63c2a;
        padding: 1.5rem 2rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        color: white;
    }

    .card-header h2 {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: white;
    }

    .subtext {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        margin: 0.25rem 0 0 0;
    }

    .tasks-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        gap: 1rem;
    }

    .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex-grow: 1;
    }

    .task-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.125rem;
    }

    .checkbox {
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.8);
        flex-shrink: 0;
    }

    .checkbox.checked {
        background: white;
        position: relative;
    }

    .checkbox.checked::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0.75rem;
        height: 0.5rem;
        border-left: 3px solid #a63c2a;
        border-bottom: 3px solid #a63c2a;
        transform: rotate(-45deg);
        transform-origin: center;
    }

    .task-label {
        color: white;
        background: none;
        border: none;
        font-size: inherit;
        font-family: inherit;
        padding: 0;
        margin: 0;
    }

    .task-label.completed {
        text-decoration: line-through;
        color: rgba(255, 255, 255, 0.6);
    }

    .task-label.link {
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
        transition: color 0.2s;
        text-align: left;
    }

    .task-label.link:hover {
        color: rgba(255, 255, 255, 0.8);
    }

    .cta-section {
        margin-top: 0.5rem;
    }

    .cta-text {
        font-size: 1rem;
        color: white;
        margin: 0;
        font-weight: 600;
    }

    .task-label.link:disabled {
        opacity: 0.6;
        cursor: wait;
    }

    @media (min-width: 768px) {
        .card-header h2 {
            font-size: 1.875rem;
        }

        .subtext {
            font-size: 1rem;
        }

        .task-item {
            gap: 1rem;
            font-size: 1.25rem;
        }
    }
</style>

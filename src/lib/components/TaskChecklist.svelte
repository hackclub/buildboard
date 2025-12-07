<script lang="ts">
    import { getUser, updateUser, hasRole } from '$lib/state/user.svelte';

    interface SetupStatus {
        hasHackatime: boolean;
        isSlackMember: boolean;
        isIdvComplete: boolean;
        storylineComplete: boolean;
        onboardingComplete: boolean;
    }

    let { setupStatus }: { setupStatus: SetupStatus } = $props();

    let user = $derived(getUser());

    let tasks = $derived([
        {
            id: 'storyline',
            label: 'Complete the storyline',
            complete: setupStatus.storylineComplete,
            action: '/app/onboarding',
            actionLabel: 'Watch Story'
        },
        {
            id: 'hackatime',
            label: 'Set up Hackatime tracking',
            complete: setupStatus.hasHackatime,
            action: '/app/settings/hackatime',
            actionLabel: 'Set Up'
        },
        {
            id: 'slack',
            label: 'Join the Slack community',
            complete: setupStatus.isSlackMember,
            action: 'https://hackclub.com/slack',
            actionLabel: 'Join Slack',
            external: true
        },
        {
            id: 'idv',
            label: 'Verify your identity',
            complete: setupStatus.isIdvComplete,
            action: '/app/settings/idv',
            actionLabel: 'Verify'
        }
    ]);

    let completedCount = $derived(tasks.filter(t => t.complete).length);
    let allComplete = $derived(completedCount === tasks.length);
    let progressPercent = $derived(Math.round((completedCount / tasks.length) * 100));

    async function markOnboardingComplete() {
        if (user && allComplete && !setupStatus.onboardingComplete) {
            await fetch(`/api/users/${user.user_id}/onboarding-complete`, {
                method: 'POST'
            });
            await updateUser();
        }
    }

    $effect(() => {
        if (allComplete && !setupStatus.onboardingComplete) {
            markOnboardingComplete();
        }
    });
</script>

{#if !setupStatus.onboardingComplete}
    <div class="task-checklist">
        <div class="header">
            <h3>🚀 Get Started</h3>
            <span class="progress">{completedCount}/{tasks.length} complete</span>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: {progressPercent}%"></div>
        </div>

        <ul class="tasks">
            {#each tasks as task}
                <li class="task" class:complete={task.complete}>
                    <span class="checkbox">
                        {#if task.complete}
                            ✓
                        {:else}
                            ○
                        {/if}
                    </span>
                    <span class="label">{task.label}</span>
                    {#if !task.complete}
                        <a
                            href={task.action}
                            class="action-btn"
                            target={task.external ? '_blank' : undefined}
                            rel={task.external ? 'noopener noreferrer' : undefined}
                        >
                            {task.actionLabel}
                        </a>
                    {/if}
                </li>
            {/each}
        </ul>

        {#if allComplete}
            <div class="complete-banner">
                🎉 You're all set! Welcome to BuildBoard!
            </div>
        {/if}
    </div>
{/if}

<style>
    .task-checklist {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #1e293b;
    }

    .progress {
        font-size: 0.875rem;
        color: #64748b;
        font-weight: 500;
    }

    .progress-bar {
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 16px;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
        border-radius: 3px;
        transition: width 0.3s ease;
    }

    .tasks {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .task {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }

    .task.complete {
        background: #f0fdf4;
        border-color: #bbf7d0;
    }

    .checkbox {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .task.complete .checkbox {
        background: #10b981;
        color: white;
        font-weight: bold;
    }

    .task:not(.complete) .checkbox {
        color: #94a3b8;
        border: 2px solid #cbd5e1;
    }

    .label {
        flex: 1;
        font-size: 0.9rem;
        color: #334155;
    }

    .task.complete .label {
        color: #166534;
    }

    .action-btn {
        padding: 6px 12px;
        background: #3b82f6;
        color: white;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        text-decoration: none;
        transition: background 0.2s;
    }

    .action-btn:hover {
        background: #2563eb;
    }

    .complete-banner {
        margin-top: 16px;
        padding: 12px;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        color: white;
        border-radius: 8px;
        text-align: center;
        font-weight: 600;
    }
</style>

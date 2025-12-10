<script lang="ts">
    import type { PageData } from "./$types";
    import ReadmeEditor from "$lib/components/ReadmeEditor.svelte";

    export let data: PageData;

    let { project, readme } = data;
    
    function getSafeUrl(url: string | null | undefined): string | null {
        if (!url) return null;
        try {
            const parsed = new URL(url);
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                return url;
            }
            return null;
        } catch {
            return null;
        }
    }
    
    $: safeLiveUrl = getSafeUrl(project.live_url);
    $: safeCodeUrl = getSafeUrl(project.code_url);
    let linking = false;
    let installationId = "";
    let repoPath = "";
    let linkMessage = "";
    let linkError = "";

    function formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    }

    async function linkRepo() {
        linking = true;
        linkError = "";
        linkMessage = "";

        try {
            const response = await fetch(
                `/api/projects/${project.project_id}/github/link`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        installation_id: installationId,
                        repo_path: repoPath,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || "Failed to link repository",
                );
            }

            linkMessage = "Repository linked successfully! Refreshing...";
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (e: any) {
            linkError = e.message;
        } finally {
            linking = false;
        }
    }
</script>

<div class="page-container">
    <!-- Back Link -->
    <a href="/projects" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Projects
    </a>

    <!-- Project Header Card -->
    <div class="card header-card">
        <div class="project-badge">Week {project.submission_week}</div>
        
        <h1>{project.project_name}</h1>
        {#if project.project_description}
            <p class="project-description">{project.project_description}</p>
        {/if}

        <div class="stats-row">
            <div class="stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                </svg>
                <span class="stat-value">{formatTime(project.time_spent || 0)}</span>
                <span class="stat-label">logged</span>
            </div>
        </div>

        <div class="project-links">
            {#if safeLiveUrl}
                <a href={safeLiveUrl} target="_blank" rel="noopener noreferrer" class="link-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Live Demo
                </a>
            {/if}
            {#if safeCodeUrl}
                <a href={safeCodeUrl} target="_blank" rel="noopener noreferrer" class="link-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                    </svg>
                    Source Code
                </a>
            {/if}
        </div>
    </div>

    <!-- GitHub Integration Card -->
    <div class="card">
        <div class="card-header">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                </svg>
                GitHub Integration
            </h2>
        </div>

        {#if project.github_installation_id && project.github_repo_path}
            <div class="linked-repo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                <span>Linked to <strong>{project.github_repo_path}</strong></span>
            </div>

            <div class="readme-section">
                <ReadmeEditor
                    projectId={project.project_id}
                    initialContent={readme?.content || ""}
                    initialSha={readme?.sha || null}
                />
            </div>
        {:else}
            <div class="link-form">
                <p class="form-hint">
                    Link a GitHub repository to enable README editing and sync.
                </p>

                <div class="form-group">
                    <label for="installation-id">Installation ID</label>
                    <input
                        id="installation-id"
                        type="text"
                        bind:value={installationId}
                        placeholder="e.g. 12345678"
                    />
                </div>

                <div class="form-group">
                    <label for="repo-path">Repository Path</label>
                    <input
                        id="repo-path"
                        type="text"
                        bind:value={repoPath}
                        placeholder="e.g. owner/repo"
                    />
                </div>

                {#if linkError}
                    <div class="form-error">{linkError}</div>
                {/if}
                {#if linkMessage}
                    <div class="form-success">{linkMessage}</div>
                {/if}

                <button
                    class="btn-primary"
                    on:click={linkRepo}
                    disabled={linking}
                >
                    {linking ? "Linking..." : "Link Repository"}
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    .page-container {
        max-width: 700px;
        margin: 0 auto;
        padding: 0 1rem 3rem;
    }

    /* Back Link */
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
        font-size: 0.9rem;
        text-decoration: none;
        margin-bottom: 1.5rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--bb-primary);
    }

    /* Cards */
    .card {
        background: rgba(46, 34, 33, 0.95);
        border-radius: 8px;
        padding: 1.5rem 2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    }

    .card-header {
        margin-bottom: 1.25rem;
    }

    .card-header h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        margin: 0;
    }

    /* Header Card */
    .header-card {
        padding: 2rem;
    }

    .project-badge {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--bb-primary);
        background: rgba(255, 184, 89, 0.15);
        padding: 0.35rem 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }

    .header-card h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.5rem;
    }

    .project-description {
        font-size: 1rem;
        color: var(--bb-text-muted);
        margin: 0 0 1.5rem;
        line-height: 1.5;
    }

    .stats-row {
        display: flex;
        gap: 1.5rem;
        padding: 1rem 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 1.5rem;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
    }

    .stat svg {
        color: var(--bb-primary);
    }

    .stat-value {
        font-weight: 700;
        color: var(--bb-text-primary);
    }

    .stat-label {
        font-size: 0.85rem;
    }

    .project-links {
        display: flex;
        gap: 0.75rem;
    }

    .link-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 6px;
        color: var(--bb-text-secondary);
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.2s;
    }

    .link-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--bb-primary);
        color: var(--bb-text-primary);
    }

    /* Linked Repo */
    .linked-repo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.875rem 1rem;
        background: rgba(34, 84, 61, 0.3);
        border: 1px solid rgba(34, 84, 61, 0.5);
        border-radius: 6px;
        color: #86efac;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
    }

    .linked-repo strong {
        color: #bbf7d0;
    }

    .readme-section {
        margin-top: 1rem;
    }

    /* Link Form */
    .link-form {
        max-width: 400px;
    }

    .form-hint {
        font-size: 0.9rem;
        color: var(--bb-text-muted);
        margin: 0 0 1.25rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--bb-text-secondary);
        margin-bottom: 0.5rem;
    }

    .form-group input {
        width: 100%;
        padding: 0.65rem 0.875rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 6px;
        color: var(--bb-text-primary);
        font-size: 0.9rem;
        transition: border-color 0.2s;
    }

    .form-group input::placeholder {
        color: var(--bb-text-muted);
    }

    .form-group input:focus {
        outline: none;
        border-color: var(--bb-primary);
    }

    .form-error {
        padding: 0.65rem 0.875rem;
        background: rgba(127, 29, 29, 0.3);
        border: 1px solid rgba(185, 28, 28, 0.5);
        border-radius: 6px;
        color: #fca5a5;
        font-size: 0.85rem;
        margin-bottom: 1rem;
    }

    .form-success {
        padding: 0.65rem 0.875rem;
        background: rgba(34, 84, 61, 0.3);
        border: 1px solid rgba(34, 84, 61, 0.5);
        border-radius: 6px;
        color: #86efac;
        font-size: 0.85rem;
        margin-bottom: 1rem;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem 1.25rem;
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 0.9rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 640px) {
        .card {
            padding: 1.25rem;
        }

        .header-card {
            padding: 1.5rem 1.25rem;
        }

        .header-card h1 {
            font-size: 1.5rem;
        }

        .project-links {
            flex-direction: column;
        }
    }
</style>

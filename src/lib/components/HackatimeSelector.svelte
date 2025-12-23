<script lang="ts">
    import { onMount } from "svelte";

    export let selectedKeys: string[] = [];
    export let projectId: string = "";

    let projects: any[] = [];
    let loading = false;
    let error = "";
    let searchQuery = "";

    $: filteredProjects = searchQuery 
        ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : projects;

    $: sortedProjects = [...filteredProjects].sort((a, b) => {
        const aSelected = selectedKeys.includes(a.name);
        const bSelected = selectedKeys.includes(b.name);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return b.seconds - a.seconds;
    });

    async function fetchProjects(forceRefresh = false, autoRetry = true) {
        loading = true;
        error = "";
        try {
            if (forceRefresh) {
                const res = await fetch("/api/hackatime/refresh", { method: "POST" });
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || "Failed to refresh Hackatime projects");
                }
                const refreshedProjects = await res.json();
                if (Array.isArray(refreshedProjects) && refreshedProjects.length > 0) {
                    projects = refreshedProjects;
                    loading = false;
                    return;
                }
            }

            const [linkedRes, unlinkedRes] = await Promise.all([
                projectId ? fetch(`/api/projects/${projectId}/hackatime-projects`) : Promise.resolve(null),
                fetch("/api/hackatime/unlinked")
            ]);

            let linkedProjects: any[] = [];
            let unlinkedProjects: any[] = [];

            if (linkedRes && linkedRes.ok) {
                linkedProjects = await linkedRes.json();
            }

            if (unlinkedRes.ok) {
                unlinkedProjects = await unlinkedRes.json();
            } else {
                const errorData = await unlinkedRes.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch available Hackatime projects");
            }

            const linkedNames = new Set(linkedProjects.map((p: any) => p.name));
            projects = [
                ...linkedProjects,
                ...unlinkedProjects.filter((p: any) => !linkedNames.has(p.name))
            ];

            if (linkedProjects.length > 0 && selectedKeys.length === 0) {
                selectedKeys = linkedProjects.map((p: any) => p.name);
            }

            if (projects.length === 0 && autoRetry && !forceRefresh) {
                await fetchProjects(true, false);
                return;
            }
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function toggleProject(name: string) {
        if (selectedKeys.includes(name)) {
            selectedKeys = selectedKeys.filter((k) => k !== name);
        } else {
            selectedKeys = [...selectedKeys, name];
        }
    }

    function formatTime(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h === 0) return `${m}m`;
        return `${h}h ${m}m`;
    }

    function deselectAll() {
        selectedKeys = [];
    }

    onMount(() => {
        fetchProjects();
    });
</script>

<div class="hackatime-selector">
    <div class="selector-header">
        <div class="header-left">
            <h3>Link Hackatime Projects</h3>
            <span class="project-count">
                {selectedKeys.length} selected
                {#if projects.length > 0}
                    of {projects.length}
                {/if}
            </span>
        </div>
        <button
            type="button"
            class="refresh-btn"
            on:click={() => fetchProjects(true)}
            disabled={loading}
        >
            <svg class="refresh-icon" class:spinning={loading} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            {loading ? "Syncing..." : "Sync from Hackatime"}
        </button>
    </div>

    {#if error}
        <div class="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
        </div>
    {/if}

    {#if loading && projects.length === 0}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading your Hackatime projects...</p>
        </div>
    {:else if projects.length === 0}
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
            </svg>
            <p>No Hackatime projects found</p>
            <span>Make sure you have the Hackatime extension installed and have tracked some coding time.</span>
            <button class="btn-primary" on:click={() => fetchProjects(true)}>
                Try Refreshing
            </button>
        </div>
    {:else}
        <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Search projects..."
            />
            {#if searchQuery}
                <button class="clear-search" on:click={() => searchQuery = ""}>×</button>
            {/if}
        </div>

        <div class="quick-actions">
            <button type="button" on:click={deselectAll} class="quick-btn">Clear selection</button>
        </div>

        <div class="projects-grid">
            {#each sortedProjects as project (project.name)}
                <button
                    type="button"
                    class="project-card"
                    class:selected={selectedKeys.includes(project.name)}
                    on:click={() => toggleProject(project.name)}
                >
                    <div class="project-checkbox">
                        {#if selectedKeys.includes(project.name)}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        {/if}
                    </div>
                    <div class="project-info">
                        <span class="project-name">{project.name}</span>
                        <span class="project-time">{formatTime(project.seconds)}</span>
                    </div>
                </button>
            {/each}
        </div>

        {#if filteredProjects.length === 0 && searchQuery}
            <div class="no-results">
                No projects matching "{searchQuery}"
            </div>
        {/if}
    {/if}
</div>

<style>
    .hackatime-selector {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 0;
        padding: 1.25rem;
    }

    .selector-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .header-left h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #f5f5f5;
        margin: 0 0 0.25rem;
    }

    .project-count {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.5);
    }

    .refresh-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgba(255, 184, 89, 0.1);
        border: 1px solid rgba(255, 184, 89, 0.3);
        border-radius: 0;
        color: #ffb859;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .refresh-btn:hover:not(:disabled) {
        background: rgba(255, 184, 89, 0.2);
        border-color: #ffb859;
    }

    .refresh-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .refresh-icon {
        transition: transform 0.3s;
    }

    .refresh-icon.spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .error-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: rgba(220, 38, 38, 0.15);
        border: 1px solid rgba(220, 38, 38, 0.3);
        color: #fca5a5;
        font-size: 0.85rem;
        margin-bottom: 1rem;
    }

    .loading-state, .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
    }

    .loading-state p, .empty-state p {
        margin: 1rem 0 0.25rem;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.95rem;
    }

    .empty-state span {
        font-size: 0.85rem;
        max-width: 300px;
        line-height: 1.5;
    }

    .empty-state .btn-primary {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #ffb859;
        border: none;
        color: #1a1a1a;
        font-weight: 600;
        cursor: pointer;
    }

    .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(255, 184, 89, 0.2);
        border-top-color: #ffb859;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    .search-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 0.75rem;
    }

    .search-bar svg {
        color: rgba(255, 255, 255, 0.4);
        flex-shrink: 0;
    }

    .search-bar input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        color: #f5f5f5;
        font-size: 0.9rem;
    }

    .search-bar input::placeholder {
        color: rgba(255, 255, 255, 0.3);
    }

    .clear-search {
        background: none;
        border: none;
        color: rgba(255, 255, 255, 0.5);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0 0.25rem;
        line-height: 1;
    }

    .clear-search:hover {
        color: #fff;
    }

    .quick-actions {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .quick-btn {
        padding: 0.35rem 0.6rem;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .quick-btn:hover {
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
    }

    .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.5rem;
        max-height: 320px;
        overflow-y: auto;
        padding-right: 0.25rem;
    }

    .projects-grid::-webkit-scrollbar {
        width: 6px;
    }

    .projects-grid::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
    }

    .projects-grid::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
    }

    .project-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
        cursor: pointer;
        transition: all 0.15s;
    }

    .project-card:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
    }

    .project-card.selected {
        background: rgba(255, 184, 89, 0.1);
        border-color: rgba(255, 184, 89, 0.4);
    }

    .project-checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.15s;
    }

    .project-card.selected .project-checkbox {
        background: #ffb859;
        border-color: #ffb859;
    }

    .project-checkbox svg {
        color: #1a1a1a;
    }

    .project-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    .project-name {
        font-size: 0.85rem;
        font-weight: 500;
        color: #f5f5f5;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .project-time {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.45);
    }

    .project-card.selected .project-name {
        color: #ffb859;
    }

    .no-results {
        text-align: center;
        padding: 1.5rem;
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.9rem;
    }
</style>

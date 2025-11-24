<script lang="ts">
    import { onMount } from "svelte";

    export let selectedKeys: string[] = [];

    let projects: any[] = [];
    let loading = false;
    let error = "";

    async function fetchProjects(forceRefresh = false) {
        loading = true;
        error = "";
        try {
            const endpoint = forceRefresh
                ? "/api/hackatime/refresh"
                : "/api/hackatime/projects";
            const method = forceRefresh ? "POST" : "GET";

            const res = await fetch(endpoint, { method });
            if (!res.ok) throw new Error("Failed to fetch Hackatime projects");

            projects = await res.json();
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
        return `${h}h ${m}m`;
    }

    onMount(() => {
        fetchProjects();
    });
</script>

<div class="space-y-4">
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-bold text-neutral-700">
            Link Hackatime Projects
        </h3>
        <button
            type="button"
            on:click={() => fetchProjects(true)}
            class="text-sm text-blue-600 hover:underline disabled:opacity-50"
            disabled={loading}
        >
            {loading ? "Refreshing..." : "Refresh Stats"}
        </button>
    </div>

    {#if error}
        <p class="text-red-500 text-sm">{error}</p>
    {/if}

    {#if projects.length === 0 && !loading}
        <p class="text-neutral-500 text-sm italic">
            No Hackatime projects found. Make sure you have the Hackatime
            extension installed and are tracking time.
        </p>
    {:else}
        <div
            class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1"
        >
            {#each projects as project}
                <button
                    type="button"
                    class="flex justify-between items-center p-3 rounded border text-left transition-colors
                        {selectedKeys.includes(project.name)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'}"
                    on:click={() => toggleProject(project.name)}
                >
                    <span class="font-medium truncate mr-2">{project.name}</span
                    >
                    <span class="text-sm opacity-75 whitespace-nowrap"
                        >{formatTime(project.seconds)}</span
                    >
                </button>
            {/each}
        </div>
    {/if}
</div>

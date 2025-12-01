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

<div class="container mx-auto pt-10 px-4">
    <div class="mb-8">
        <h1 class="text-4xl font-bold text-neutral-800 mb-2">
            {project.project_name}
        </h1>
        <p class="text-xl text-neutral-600">{project.project_description}</p>
        <div class="mt-4 flex space-x-4">
            {#if safeLiveUrl}
                <a
                    href={safeLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline">Live Demo</a
                >
            {/if}
            {#if safeCodeUrl}
                <a
                    href={safeCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-600 hover:underline">Source Code</a
                >
            {/if}
        </div>
    </div>

    <hr class="my-8 border-neutral-200" />

    <div class="mb-8">
        <h2 class="text-2xl font-bold text-neutral-800 mb-4">
            GitHub Integration
        </h2>

        {#if project.github_installation_id && project.github_repo_path}
            <div
                class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
            >
                <p class="text-green-800">
                    Linked to <strong>{project.github_repo_path}</strong>
                </p>
            </div>

            <ReadmeEditor
                projectId={project.project_id}
                initialContent={readme?.content || ""}
                initialSha={readme?.sha || null}
            />
        {:else}
            <div class="bg-white rounded-lg shadow p-6 max-w-xl">
                <h3 class="text-lg font-semibold mb-4">
                    Link GitHub Repository
                </h3>
                <p class="text-gray-600 mb-4 text-sm">
                    Enter the GitHub App Installation ID and the Repository Path
                    (owner/repo) to enable README editing.
                    <br />
                    <span class="text-xs text-gray-500"
                        >(Note: In a full implementation, this would be handled
                        via OAuth flow)</span
                    >
                </p>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700"
                            >Installation ID</label
                        >
                        <input
                            type="text"
                            bind:value={installationId}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="e.g. 12345678"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700"
                            >Repository Path</label
                        >
                        <input
                            type="text"
                            bind:value={repoPath}
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="e.g. owner/repo"
                        />
                    </div>

                    {#if linkError}
                        <p class="text-red-600 text-sm">{linkError}</p>
                    {/if}
                    {#if linkMessage}
                        <p class="text-green-600 text-sm">{linkMessage}</p>
                    {/if}

                    <button
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        on:click={linkRepo}
                        disabled={linking}
                    >
                        {linking ? "Linking..." : "Link Repository"}
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

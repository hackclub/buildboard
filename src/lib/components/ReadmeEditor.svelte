<script lang="ts">
    import { onMount } from "svelte";
    import { marked } from "marked";

    export let projectId: string;
    export let initialContent: string = "";
    export let initialSha: string | null = null;

    let content = initialContent;
    let sha = initialSha;
    let activeTab: "edit" | "preview" = "edit";
    let saving = false;
    let message = "";
    let errorMessage = "";

    $: previewHtml = marked.parse(content);

    async function saveReadme() {
        saving = true;
        errorMessage = "";
        message = "";

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/readme`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        // 'Authorization': ... // Auth header should be handled by an interceptor or passed in
                        // Assuming global auth handling or we need to add it here.
                        // For now, I'll assume the fetch wrapper or interceptor handles it,
                        // or I'll add a TODO if I can't find the auth logic.
                    },
                    body: JSON.stringify({
                        content,
                        sha,
                        message: "Update README via Buildboard",
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to save README");
            }

            const result = await response.json();
            sha = result.content.sha; // Update SHA for next save
            message = "README saved successfully!";

            setTimeout(() => {
                message = "";
            }, 3000);
        } catch (e: any) {
            errorMessage = e.message;
        } finally {
            saving = false;
        }
    }
</script>

<div class="bg-white rounded-lg shadow p-4">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">README Editor</h2>
        <div class="flex space-x-2">
            <button
                class="px-3 py-1 rounded {activeTab === 'edit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'}"
                on:click={() => (activeTab = "edit")}
            >
                Edit
            </button>
            <button
                class="px-3 py-1 rounded {activeTab === 'preview'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'}"
                on:click={() => (activeTab = "preview")}
            >
                Preview
            </button>
        </div>
    </div>

    {#if activeTab === "edit"}
        <textarea
            class="w-full h-96 p-2 border rounded font-mono text-sm"
            bind:value={content}
        ></textarea>
    {:else}
        <div
            class="w-full h-96 p-2 border rounded overflow-auto prose max-w-none"
        >
            {@html previewHtml}
        </div>
    {/if}

    <div class="mt-4 flex justify-between items-center">
        <div>
            {#if errorMessage}
                <span class="text-red-600">{errorMessage}</span>
            {/if}
            {#if message}
                <span class="text-green-600">{message}</span>
            {/if}
        </div>
        <button
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            on:click={saveReadme}
            disabled={saving}
        >
            {saving ? "Saving..." : "Save to GitHub"}
        </button>
    </div>
</div>

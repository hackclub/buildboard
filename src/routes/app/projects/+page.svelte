<script lang="ts">
    import type { PageData } from "./$types";
    import { onMount } from "svelte";
    import TaskChecklist from "$lib/components/TaskChecklist.svelte";

    let { data }: { data: PageData } = $props();

    let innerWidth = $state(0);
    let innerHeight = $state(0);
    let mediumSize = $derived(innerWidth < 1850 || innerHeight < 1100);

    onMount(() => {
        const updateSize = () => {
            innerWidth = window.innerWidth;
            innerHeight = window.innerHeight;
        };

        updateSize();
        window.addEventListener("resize", updateSize);

        return () => {
            window.removeEventListener("resize", updateSize);
        };
    });
</script>

<div class="container mx-auto pt-10">
    <!-- Task checklist - friendly, non-blocking -->
    {#if data.setupStatus}
        <TaskChecklist setupStatus={data.setupStatus} />
    {/if}

    <div class="mt-3">
        <h2
            class="{mediumSize
                ? 'text-3xl'
                : 'text-5xl'} font-bold text-neutral-700 mb-1"
        >
            Your Recent Projects
        </h2>

        {#if data.projects.length === 0}
            <p
                class="{mediumSize
                    ? 'text-xl'
                    : 'text-3xl'} text-neutral-600 mb-6"
            >
                No projects found.
            </p>
            <a
                href="/app/projects/select"
                class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >Create Your First Project</a
            >
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- New Project Card -->
                <a
                    href="/app/projects/select"
                    class="block {mediumSize ? 'max-w-sm' : ''} group"
                >
                    <div
                        class="rounded-lg shadow-lg overflow-hidden h-full border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-neutral-50 flex flex-col items-center justify-center p-8 transition-colors"
                    >
                        <span
                            class="text-5xl text-neutral-400 group-hover:text-neutral-600 mb-2"
                            >+</span
                        >
                        <span
                            class="font-bold text-neutral-500 group-hover:text-neutral-700"
                            >New Project</span
                        >
                    </div>
                </a>

                {#each data.projects
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3) as project}
                    <div class="block {mediumSize ? 'max-w-sm' : ''}">
                        <div
                            class="rounded-lg shadow-lg overflow-hidden hover:scale-105 relative bg-white"
                        >
                            <div class={mediumSize ? "p-2 pb-10" : "p-4 pb-12"}>
                                <a
                                    href={`/app/projects/${project.project_id}`}
                                    class="hover:underline"
                                >
                                    <h3
                                        class="{mediumSize
                                            ? 'text-sm'
                                            : 'text-xl'} font-bold text-neutral-800 mb-2"
                                    >
                                        {project.project_name}
                                    </h3>
                                </a><a
                                    href={project.code_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="absolute right-10 hover:scale-110 {mediumSize
                                        ? 'text-xs'
                                        : 'text-sm'}">Code</a
                                >
                                <p
                                    class="{mediumSize
                                        ? 'text-xs'
                                        : 'text-sm'} text-neutral-600"
                                >
                                    Time spent: {Math.floor(
                                        project.time_spent / 60,
                                    )}h {project.time_spent % 60}m
                                </p>
                                <p
                                    class="{mediumSize
                                        ? 'text-[10px]'
                                        : 'text-xs'} text-neutral-500 mt-1"
                                >
                                    Week {project.submission_week}
                                </p>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    
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
        window.addEventListener('resize', updateSize);
        
        return () => {
            window.removeEventListener('resize', updateSize);
        };
    });
</script>

<div class="container mx-auto pt-10">
    <div class="mt-3">
        <h2 class="{mediumSize ? 'text-3xl' : 'text-5xl'} font-bold text-neutral-700 mb-1">Your Recent Projects</h2>
        
        {#if data.projects.length === 0}
            <p class="{mediumSize ? 'text-xl' : 'text-3xl'} text-neutral-600">No projects found.</p>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each data.projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3) as project}
                    <div class="block {mediumSize ? 'max-w-sm' : ''}">
                        <div class="rounded-lg shadow-lg overflow-hidden hover:scale-105 relative bg-white">
                            <div class="{mediumSize ? 'p-2 pb-10' : 'p-4 pb-12'}">
                                <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                    <h3 class="{mediumSize ? 'text-sm' : 'text-xl'} font-bold text-neutral-800 mb-2">{project.project_name}</h3>
                                </a><a 
                                href={project.code_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class="absolute right-10 hover:scale-110 {mediumSize ? 'text-xs' : 'text-sm'}"
                            >Code</a>
                                <p class="{mediumSize ? 'text-xs' : 'text-sm'} text-neutral-600">Time spent: {Math.floor(project.time_spent / 60)}h {project.time_spent % 60}m</p>
                                <p class="{mediumSize ? 'text-[10px]' : 'text-xs'} text-neutral-500 mt-1">Week {project.submission_week}</p>
                                
                            </div>
                        
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    
    let loading = false;
    let error = '';
    
    const type = $page.url.searchParams.get('type') || 'wildcard';
    let title = '';
    let description = '';
    
    const typeLabels: Record<string, string> = {
        website: 'Website',
        game: 'Game',
        mobile: 'Mobile App',
        cli: 'Terminal CLI',
        desktop: 'Desktop App',
        wildcard: 'Project'
    };
    
    async function handleSubmit() {
        if (!title || !description) {
            error = 'Please fill in all fields';
            return;
        }
        
        loading = true;
        error = '';
        
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectTitle: title,
                    projectDescription: description,
                    projectType: type
                })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create project');
            }
            
            await goto('/app/projects');
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto pt-10 px-4 max-w-2xl">
    <a href="/app/projects/select" class="text-neutral-500 hover:underline mb-4 block">&larr; Back to selection</a>
    
    <h1 class="text-4xl font-bold text-neutral-700 mb-8 uppercase">Create your {typeLabels[type] || 'Project'}</h1>
    
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit} class="bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div>
            <label class="block text-neutral-700 text-sm font-bold mb-2" for="title">
                Project Name
            </label>
            <input 
                id="title"
                type="text" 
                bind:value={title}
                class="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                placeholder="My Awesome Project"
                maxlength="30"
            />
            <p class="text-right text-xs text-neutral-400 mt-1">{title.length}/30</p>
        </div>
        
        <div>
            <label class="block text-neutral-700 text-sm font-bold mb-2" for="description">
                Description
            </label>
            <textarea 
                id="description"
                bind:value={description}
                class="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 h-32"
                placeholder="What are you building?"
                maxlength="300"
            ></textarea>
            <p class="text-right text-xs text-neutral-400 mt-1">{description.length}/300</p>
        </div>
        
        <button 
            type="submit" 
            disabled={loading}
            class="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
        >
            {loading ? 'Creating...' : 'Create Project'}
        </button>
    </form>
</div>

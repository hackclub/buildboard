<script lang="ts">
    interface Project {
        project_id: string;
        user_id: string;
        project_name: string;
        project_description: string;
        project_type: string;
        attachment_urls: string[];
        code_url: string;
        live_url: string;
        submission_week: string;
        paper_url: string;
        shipped: boolean;
        sent_to_airtable: boolean;
        github_installation_id: string;
        github_repo_path: string;
        time_spent: number;
        hackatime_projects: string[];
        hackatime_hours: number;
        created_at: string;
        updated_at: string;
    }

    interface User {
        user_id: string;
        handle: string;
        profile: {
            avatar_url: string;
            bio: string;
            is_public: boolean;
            slack_id: string;
        };
        roles: { role_id: string }[];
        created_at: string;
    }

    let projects = $state<Project[]>([]);
    let users = $state<Map<string, User>>(new Map());
    let loading = $state(true);
    let error = $state<string | null>(null);
    let currentPage = $state(0);
    let hasMore = $state(true);
    const limit = 100;

    async function fetchUsers() {
        try {
            const res = await fetch('/api/admin/users?limit=500');
            if (res.ok) {
                const data: User[] = await res.json();
                users = new Map(data.map(u => [u.user_id, u]));
            }
        } catch {
            // Silently fail - we'll just show user IDs
        }
    }

    async function fetchProjects(page: number) {
        loading = true;
        error = null;
        try {
            const skip = page * limit;
            const res = await fetch(`/api/admin/projects?skip=${skip}&limit=${limit}`);
            if (!res.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data: Project[] = await res.json();
            projects = data;
            hasMore = data.length === limit;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            loading = false;
        }
    }

    function goToPage(page: number) {
        currentPage = page;
        fetchProjects(page);
    }

    $effect(() => {
        fetchUsers();
        fetchProjects(0);
    });
</script>

<div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-white">All Projects</h1>
        <a href="/admin" class="text-neutral-400 hover:text-white transition-colors">
            ← Back to Admin
        </a>
    </div>

    {#if loading}
        <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p class="text-neutral-400 mt-4">Loading projects...</p>
        </div>
    {:else if error}
        <div class="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded">
            {error}
        </div>
    {:else if projects.length === 0}
        <div class="text-center py-12">
            <p class="text-neutral-400">No projects found.</p>
        </div>
    {:else}
        <div class="bg-neutral-900 shadow-sm border border-neutral-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-neutral-800 border-b border-neutral-700">
                        <tr>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">Name</th>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">Type</th>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">User ID</th>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">Hours</th>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">Week</th>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">Shipped</th>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">Created</th>
                            <th class="px-4 py-3 text-left font-semibold text-neutral-200">Links</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-700">
                        {#each projects as project}
                            <tr class="hover:bg-neutral-800 transition-colors">
                                <td class="px-4 py-3">
                                    <a 
                                        href="/projects/{project.project_id}" 
                                        class="text-blue-400 hover:underline font-medium"
                                    >
                                        {project.project_name}
                                    </a>
                                    {#if project.project_description}
                                        <p class="text-neutral-400 text-xs mt-1 truncate max-w-xs">
                                            {project.project_description}
                                        </p>
                                    {/if}
                                </td>
                                <td class="px-4 py-3 text-neutral-300">{project.project_type || '-'}</td>
                                <td class="px-4 py-3">
                                    {#if users.get(project.user_id)}
                                        {@const user = users.get(project.user_id)!}
                                        <a 
                                            href="/admin/users/{project.user_id}" 
                                            class="inline-flex items-center gap-2 text-blue-400 hover:underline"
                                        >
                                            {#if user.profile?.avatar_url}
                                                <img 
                                                    src={user.profile.avatar_url} 
                                                    alt="" 
                                                    class="w-5 h-5 rounded-full"
                                                />
                                            {/if}
                                            <span class="text-xs">{user.handle}</span>
                                        </a>
                                    {:else}
                                        <a 
                                            href="/admin/users/{project.user_id}" 
                                            class="text-xs text-blue-400 hover:underline font-mono"
                                        >
                                            {project.user_id.slice(0, 8)}...
                                        </a>
                                    {/if}
                                </td>
                                <td class="px-4 py-3 text-neutral-300">
                                    {project.hackatime_hours?.toFixed(1) || '0'}
                                </td>
                                <td class="px-4 py-3 text-neutral-300">{project.submission_week || '-'}</td>
                                <td class="px-4 py-3">
                                    {#if project.shipped}
                                        <span class="inline-flex items-center px-2 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded">
                                            Yes
                                        </span>
                                    {:else}
                                        <span class="inline-flex items-center px-2 py-1 bg-neutral-700 text-neutral-400 text-xs font-medium rounded">
                                            No
                                        </span>
                                    {/if}
                                </td>
                                <td class="px-4 py-3 text-neutral-400 text-xs">
                                    {new Date(project.created_at).toLocaleDateString()}
                                </td>
                                <td class="px-4 py-3">
                                    <div class="flex gap-2">
                                        {#if project.code_url}
                                            <a 
                                                href={project.code_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                class="text-neutral-500 hover:text-neutral-200"
                                                title="Code"
                                            >
                                                📦
                                            </a>
                                        {/if}
                                        {#if project.live_url}
                                            <a 
                                                href={project.live_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                class="text-neutral-500 hover:text-neutral-200"
                                                title="Live"
                                            >
                                                🌐
                                            </a>
                                        {/if}
                                        {#if project.github_repo_path}
                                            <a 
                                                href="https://github.com/{project.github_repo_path}" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                class="text-neutral-500 hover:text-neutral-200"
                                                title="GitHub"
                                            >
                                                🐙
                                            </a>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-6">
            <p class="text-neutral-400 text-sm">
                Showing {currentPage * limit + 1} - {currentPage * limit + projects.length} projects
            </p>
            <div class="flex gap-2">
                <button
                    onclick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    class="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                <span class="px-4 py-2 text-neutral-400">
                    Page {currentPage + 1}
                </span>
                <button
                    onclick={() => goToPage(currentPage + 1)}
                    disabled={!hasMore}
                    class="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    {/if}
</div>

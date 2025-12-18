<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    const user = data.user;

    function formatDate(dateString: string | null): string {
        if (!dateString) return 'Not completed';
        return new Date(dateString).toLocaleString();
    }
</script>

<div class="container mx-auto p-6 max-w-4xl">
    <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-white">User Details</h1>
        <a href="/admin/projects" class="text-neutral-400 hover:text-white transition-colors">
            ← Back to Projects
        </a>
    </div>

    <div class="bg-neutral-900 border border-neutral-700 rounded-lg p-6 space-y-6">
        <!-- User Header -->
        <div class="flex items-center gap-4 pb-6 border-b border-neutral-700">
            {#if user.profile?.avatar_url}
                <img 
                    src={user.profile.avatar_url} 
                    alt={user.handle} 
                    class="w-20 h-20 rounded-full"
                />
            {:else}
                <div class="w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center text-2xl text-neutral-400">
                    {user.handle?.charAt(0).toUpperCase() || '?'}
                </div>
            {/if}
            <div>
                <h2 class="text-2xl font-semibold text-white">{user.handle}</h2>
                <p class="text-neutral-400 text-sm font-mono">{user.user_id}</p>
                {#if user.ysws_eligible}
                    <span class="inline-flex items-center px-2 py-1 mt-2 bg-green-900/50 text-green-400 text-xs font-medium rounded">
                        YSWS Eligible
                    </span>
                {/if}
            </div>
        </div>

        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Account Info</h3>
                <dl class="space-y-2">
                    <div class="flex justify-between">
                        <dt class="text-neutral-400">Referral Code</dt>
                        <dd class="text-white font-mono">{user.referral_code || '-'}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-neutral-400">Verification Status</dt>
                        <dd class="text-white">{user.verification_status || '-'}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-neutral-400">Has Address</dt>
                        <dd class="text-white">{user.has_address ? 'Yes' : 'No'}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-neutral-400">Created At</dt>
                        <dd class="text-white">{formatDate(user.created_at)}</dd>
                    </div>
                </dl>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Profile</h3>
                <dl class="space-y-2">
                    <div class="flex justify-between">
                        <dt class="text-neutral-400">Public Profile</dt>
                        <dd class="text-white">{user.profile?.is_public ? 'Yes' : 'No'}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-neutral-400">Slack ID</dt>
                        <dd class="text-white font-mono text-sm">{user.profile?.slack_id || '-'}</dd>
                    </div>
                    {#if user.profile?.bio}
                        <div class="pt-2">
                            <dt class="text-neutral-400 mb-1">Bio</dt>
                            <dd class="text-white text-sm">{user.profile.bio}</dd>
                        </div>
                    {/if}
                </dl>
            </div>
        </div>

        <!-- Roles -->
        <div>
            <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Roles</h3>
            {#if user.roles && user.roles.length > 0}
                <div class="flex flex-wrap gap-2">
                    {#each user.roles as role}
                        <span class="inline-flex items-center px-3 py-1 bg-blue-900/50 text-blue-400 text-sm font-medium rounded">
                            {role.role_id}
                        </span>
                    {/each}
                </div>
            {:else}
                <p class="text-neutral-500 text-sm">No roles assigned</p>
            {/if}
        </div>

        <!-- Onboarding Status -->
        <div>
            <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Onboarding Progress</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center justify-between p-3 bg-neutral-800 rounded">
                    <span class="text-neutral-300">Storyline</span>
                    {#if user.storyline_completed_at}
                        <span class="text-green-400 text-sm">{formatDate(user.storyline_completed_at)}</span>
                    {:else}
                        <span class="text-neutral-500 text-sm">Not completed</span>
                    {/if}
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-800 rounded">
                    <span class="text-neutral-300">Hackatime</span>
                    {#if user.hackatime_completed_at}
                        <span class="text-green-400 text-sm">{formatDate(user.hackatime_completed_at)}</span>
                    {:else}
                        <span class="text-neutral-500 text-sm">Not completed</span>
                    {/if}
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-800 rounded">
                    <span class="text-neutral-300">Slack Linked</span>
                    {#if user.slack_linked_at}
                        <span class="text-green-400 text-sm">{formatDate(user.slack_linked_at)}</span>
                    {:else}
                        <span class="text-neutral-500 text-sm">Not completed</span>
                    {/if}
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-800 rounded">
                    <span class="text-neutral-300">ID Verification</span>
                    {#if user.idv_completed_at}
                        <span class="text-green-400 text-sm">{formatDate(user.idv_completed_at)}</span>
                    {:else}
                        <span class="text-neutral-500 text-sm">Not completed</span>
                    {/if}
                </div>
                <div class="flex items-center justify-between p-3 bg-neutral-800 rounded md:col-span-2">
                    <span class="text-neutral-300">Onboarding Complete</span>
                    {#if user.onboarding_completed_at}
                        <span class="text-green-400 text-sm">{formatDate(user.onboarding_completed_at)}</span>
                    {:else}
                        <span class="text-neutral-500 text-sm">Not completed</span>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    import { useFlag } from '@unleash/proxy-client-svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { browser } from '$app/environment';
    import { getUser, updateUser, isLoading } from '$lib/state/user.svelte';
    import { onMount } from 'svelte';

    let { children } = $props();
    const platformEnabled = useFlag('enable-platform');
    
    let user = $derived(getUser());
    let loading = $derived(isLoading());

    $effect(() => {
        if (browser && !$platformEnabled) {
            goto('/');
        }
    });

    onMount(async () => {
        if (browser) {
            const u = await updateUser();
            if (!u) {
                goto('/');
            }
        }
    });
</script>

{#if $platformEnabled}
    {#if loading && !user}
        <div class="loading-screen">
            <p>Loading...</p>
        </div>
    {:else if user}
        <div class="app-layout">
            <nav>
                <div class="user-profile">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" class="avatar" />
                    <span class="email">{user.email}</span>
                </div>
                <a href="/app/projects" class:active={page.url.pathname.includes('/projects')}>Projects</a>
                <a href="/app/settings" class:active={page.url.pathname.includes('/settings')}>Settings</a>
            </nav>
            <main>
                {@render children?.()}
            </main>
        </div>
    {/if}
{/if}

<style>
    .app-layout {
        display: flex;
        min-height: 100vh;
    }
    .loading-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
    }
    nav {
        width: 250px;
        background: #f4f4f5;
        padding: 2rem;
        border-right: 1px solid #e4e4e7;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e4e4e7;
        font-size: 0.9rem;
        overflow: hidden;
    }
    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
    .email {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    main {
        flex: 1;
        padding: 2rem;
    }
    a {
        text-decoration: none;
        color: #52525b;
        padding: 0.5rem;
        border-radius: 4px;
    }
    a:hover {
        background: #e4e4e7;
    }
    .active {
        background: #e4e4e7;
        color: #000;
        font-weight: bold;
    }
</style>

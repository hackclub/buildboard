<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { getUser, updateUser, isLoading, isAdmin } from "$lib/state/user.svelte";
    import { onMount } from "svelte";

    let { children } = $props();
    let platformEnabled = $derived($page.data.flags?.enablePlatform);

    let user = $derived(getUser());
    let loading = $derived(isLoading());

    $effect(() => {
        if (browser && !platformEnabled) {
            goto("/");
        }
    });

    onMount(async () => {
        if (browser) {
            const u = await updateUser();
            if (!u) {
                goto("/");
            }
        }
    });
</script>

{#if platformEnabled}
    {#if loading && !user}
        <div class="loading-screen">
            <p>Loading...</p>
        </div>
    {:else if user}
        <div class="app-background"></div>
        <div class="app-layout">
            <nav>
                <a
                    href={`/@${user.handle}`}
                    class="user-profile"
                    class:active={$page.url.pathname.includes("/@")}
                >
                    <img
                        src={user.profile?.avatar_url ||
                            `https://ui-avatars.com/api/?name=${user.handle || 'U'}`}
                        alt="Avatar"
                        class="avatar"
                    />
                    <span class="email">@{user.handle || 'user'}</span>
                </a>
                <a
                    href="/app/projects"
                    class:active={$page.url.pathname.includes("/projects")}
                    >Projects</a
                >
                {#if isAdmin(user)}
                    <a
                        href="/app/admin"
                        class:active={$page.url.pathname.includes("/admin")}
                        >Admin</a
                    >
                {/if}
                <a
                    href="/app/settings"
                    class:active={$page.url.pathname.includes("/settings")}
                    >Settings</a
                >
            </nav>
            <main>
                {@render children?.()}
            </main>
        </div>
    {/if}
{/if}

<style>
    .app-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-image: url('/platfromBackground.jpg');
        background-size: cover;
        background-position: center;
        z-index: 0;
    }
    .app-layout {
        position: relative;
        z-index: 1;
        display: flex;
        min-height: 100vh;
    }
    .loading-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100vw;
        background-image: url('/platfromBackground.jpg');
        background-size: cover;
        background-position: center;
    }
    nav {
        width: 250px;
        background-image: url('/platfromBackground.jpg');
        background-size: cover;
        background-position: left center;
        border-right: 2px solid var(--bb-accent-dark);
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid var(--bb-accent-dark);
        font-size: 0.9rem;
        overflow: hidden;
        color: var(--bb-text-secondary);
        text-decoration: none;
    }
    .user-profile:hover {
        background: var(--bb-accent-dark);
        color: var(--bb-text-primary);
    }
    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid var(--bb-primary);
    }
    .email {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    main {
        flex: 1;
        padding: 2rem;
        color: var(--bb-text-primary);
    }
    a {
        text-decoration: none;
        color: var(--bb-text-secondary);
        padding: 0.5rem;
        border-radius: 4px;
        transition: background 0.2s, color 0.2s;
    }
    a:hover {
        background: var(--bb-accent-dark);
        color: var(--bb-primary-light);
    }
    .active {
        background: var(--bb-accent-dark);
        color: var(--bb-primary);
        font-weight: bold;
    }
    .loading-screen p {
        color: var(--bb-text-primary);
    }
</style>

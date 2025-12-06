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
        padding: 0.5rem; /* Match other links */
        padding-bottom: 1rem; /* Keep original spacing */
        border-bottom: 1px solid #e4e4e7;
        font-size: 0.9rem;
        overflow: hidden;
        color: #52525b; /* Match default link color */
        text-decoration: none;
    }
    .user-profile:hover {
        background: #e4e4e7;
        color: #000;
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

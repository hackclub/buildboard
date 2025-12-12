<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { getUser, updateUser, isLoading, isAdmin } from "$lib/state/user.svelte";
    import { onMount } from "svelte";

    let { children } = $props();

    let user = $derived(getUser());
    let loading = $derived(isLoading());
    let mobileMenuOpen = $state(false);

    onMount(async () => {
        if (browser) {
            const u = await updateUser();
            if (!u) {
                goto("/");
            }
        }
    });

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }

    function closeMobileMenu() {
        mobileMenuOpen = false;
    }
</script>

{#if loading && !user}
        <div class="loading-screen">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    {:else if user}
        <div class="app-background"></div>
        
        <!-- Mobile Header -->
        <header class="mobile-header">
            <button class="menu-btn" onclick={toggleMobileMenu} aria-label="Toggle menu">
                {#if mobileMenuOpen}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                {:else}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                {/if}
            </button>
            <span class="mobile-title">BuildBoard</span>
            <a href={`/@${user.handle}`} class="mobile-avatar">
                <img
                    src={user.profile?.avatar_url || `https://ui-avatars.com/api/?name=${user.handle || 'U'}`}
                    alt="Avatar"
                /> <!-- We could update this so It grabs slack avatars-->
            </a>
        </header>

        <!-- Mobile Overlay -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#if mobileMenuOpen}
            <div class="mobile-overlay" onclick={closeMobileMenu}></div>
        {/if}

        <div class="app-layout">
            <nav class:mobile-open={mobileMenuOpen}>
                <!-- Logo Section -->
                <div class="nav-logo">
                    <img src="/buildboard-favicon.png" alt="BuildBoard" class="logo-img" />
                    <span class="logo-text">BuildBoard</span>
                </div>

                <!-- User Profile -->
                <a
                    href={`/@${user.handle}`}
                    class="user-profile"
                    class:active={$page.url.pathname.includes("/@")}
                    onclick={closeMobileMenu}
                >
                    <img
                        src={user.profile?.avatar_url ||
                            `https://ui-avatars.com/api/?name=${user.handle || 'U'}`}
                        alt="Avatar"
                        class="avatar"
                    />
                    <div class="user-info">
                        <span class="user-handle">@{user.handle || 'user'}</span>
                    </div>
                </a>

                <!-- Navigation Links -->
                <div class="nav-section">
                    <span class="nav-section-label">Menu</span>

                    <a
                        href="/home"
                        class="nav-link"
                        class:active={$page.url.pathname === '/home'}
                        onclick={closeMobileMenu}
                    >
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9,22 9,12 15,12 15,22" />
                        </svg>
                        <span>Home</span>
                    </a>
                    
                    <a
                        href="/projects"
                        class="nav-link"
                        class:active={$page.url.pathname.includes("/projects")}
                        onclick={closeMobileMenu}
                    >
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                        </svg>
                        <span>Projects</span>
                    </a>

                    <div class="nav-link nav-link-locked" title="Coming soon">
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        <span>Explore</span>
                        <svg class="lock-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                    </div>

                    {#if isAdmin(user)}
                        <a
                            href="/admin"
                            class="nav-link"
                            class:active={$page.url.pathname.includes("/admin")}
                            onclick={closeMobileMenu}
                        >
                            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <span>Admin</span>
                        </a>
                    {/if}

                    !<!--<a
                        href="/settings"
                        class="nav-link"
                        class:active={$page.url.pathname.includes("/settings")}
                        onclick={closeMobileMenu}
                    >
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                        </svg>
                        <span>Settings</span>
                    </a> -->
                </div>

                <!-- Bottom Section -->
                <div class="nav-footer">
                    <a 
                        href="https://hackclub.slack.com/archives/C09NBSLS21Z" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="nav-link footer-link"
                        onclick={closeMobileMenu}
                    >
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Need help?</span>
                    </a>
                    <a href="/" class="nav-link footer-link" onclick={closeMobileMenu}>
                        <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16,17 21,12 16,7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Logout</span>
                    </a>
                </div>
            </nav>

            <main>
                {@render children?.()}
            </main>
        </div>
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
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        height: 100vh;
        width: 100vw;
        background-image: url('/platfromBackground.jpg');
        background-size: cover;
        background-position: center;
    }

    .loading-screen p {
        color: var(--bb-text-primary);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--bb-accent-dark);
        border-top-color: var(--bb-primary);
        border-radius: 0;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Mobile Header */
    .mobile-header {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 56px;
        background: var(--bb-bg-dark);
        border-bottom: 1px solid var(--bb-accent-dark);
        padding: 0 1rem;
        align-items: center;
        justify-content: space-between;
        z-index: 100;
    }

    .menu-btn {
        background: none;
        border: none;
        color: var(--bb-text-primary);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 6px;
        transition: background 0.2s;
    }

    .menu-btn:hover {
        background: var(--bb-accent-dark);
    }

    .mobile-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--bb-primary);
    }

    .mobile-avatar img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid var(--bb-primary);
    }

    .mobile-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 90;
        backdrop-filter: blur(2px);
    }

    /* Sidebar Navigation */
    nav {
        width: 260px;
        background: linear-gradient(165deg, rgba(46, 34, 33, 0.98) 0%, rgba(35, 25, 24, 0.98) 100%);
        backdrop-filter: blur(10px);
        border-right: 1px solid var(--bb-accent-dark);
        padding: 1.5rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        box-shadow: 
            4px 0 16px rgba(0, 0, 0, 0.25),
            2px 0 4px rgba(0, 0, 0, 0.15);
    }

    .nav-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        margin-bottom: 1rem;
    }

    .logo-img {
        width: 36px;
        height: 36px;
        border-radius: 6px;
    }

    .logo-text {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--bb-primary);
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        margin-bottom: 1.5rem;
        border-radius: 8px;
        background: rgba(109, 46, 43, 0.3);
        border: 1px solid var(--bb-accent-dark);
        text-decoration: none;
        transition: all 0.2s;
    }

    .user-profile:hover {
        background: rgba(109, 46, 43, 0.5);
        border-color: var(--bb-primary);
    }

    .user-profile.active {
        background: rgba(255, 184, 89, 0.15);
        border-color: var(--bb-primary);
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--bb-primary);
        flex-shrink: 0;
    }

    .user-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .user-handle {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-label {
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    .nav-section {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
    }

    .nav-section-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--bb-text-muted);
        padding: 0.5rem 0.75rem;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 6px;
        text-decoration: none;
        color: var(--bb-text-secondary);
        font-size: 0.9rem;
        transition: all 0.2s;
    }

    .nav-link:hover {
        background: var(--bb-accent-dark);
        color: var(--bb-text-primary);
    }

    .nav-link.active {
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        box-shadow: 
            0 2px 6px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            inset 0 -1px 1px rgba(0, 0, 0, 0.15);
    }

    .nav-link.active .nav-icon {
        stroke: var(--bb-bg-dark);
    }

    .nav-icon {
        flex-shrink: 0;
        stroke: currentColor;
    }

    .nav-link-locked {
        opacity: 0.5;
        pointer-events: none;
        cursor: not-allowed;
        position: relative;
    }

    .lock-icon {
        margin-left: auto;
        opacity: 0.7;
    }

    .nav-footer {
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--bb-accent-dark);
    }

    .footer-link {
        color: var(--bb-text-muted);
    }

    .footer-link:hover {
        color: var(--bb-text-secondary);
    }

    /* Main Content */
    main {
        flex: 1;
        padding: 2rem;
        color: var(--bb-text-primary);
        overflow-y: auto;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
        .mobile-header {
            display: flex;
        }

        .mobile-overlay {
            display: block;
        }

        .app-layout {
            padding-top: 56px;
        }

        nav {
            position: fixed;
            left: 0;
            top: 56px;
            height: calc(100vh - 56px);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 95;
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
        }

        nav.mobile-open {
            transform: translateX(0);
        }

        .nav-logo {
            display: none;
        }

        main {
            padding: 1rem;
        }
    }
</style>

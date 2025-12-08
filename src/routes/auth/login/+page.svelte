<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    onMount(() => {
        goto('/auth/idv/start');
    });
</script>

<div class="auth-page">
    <img src="/footer.png" alt="" class="auth-bg" />
    
    <div class="auth-content">
        <div class="auth-card">
            <h1>Redirecting to Hack Club Auth...</h1>
            <p class="subtitle">Please wait while we redirect you to login.</p>
        </div>
    </div>
</div>

<style>
    .auth-page {
        position: relative;
        min-height: 100vh;
        width: 100%;
        background: var(--bb-bg-dark);
    }

    .auth-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center bottom;
        pointer-events: none;
        z-index: 0;
    }

    .auth-content {
        position: relative;
        z-index: 10;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4rem 1rem 2rem;
    }

    .auth-card {
        background: rgba(46, 34, 33, 0.9);
        border: 2px solid var(--bb-primary);
        padding: 2rem 3rem;
        max-width: 28rem;
        width: 100%;
        text-align: center;
        backdrop-filter: blur(8px);
    }

    h1 {
        color: var(--bb-primary);
        font-size: 1.5rem;
        margin: 0 0 0.5rem 0;
    }

    .subtitle {
        color: var(--bb-text-secondary);
        margin: 0;
        font-size: 1rem;
    }
</style>

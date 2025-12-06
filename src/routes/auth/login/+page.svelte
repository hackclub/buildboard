<script>
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    
    let email = $derived($page.url.searchParams.get('email') || '');
    let showOtpForm = $derived(!!email);
    let submitting = $state(false);
    let error = $state('');
    
    const handleEmailSubmit = () => {
        submitting = true;
        return async ({ result }) => {
            submitting = false;
            if (result.type === 'redirect') {
                goto(result.location);
            } else if (result.type === 'failure') {
                error = result.data?.message || 'Something went wrong';
            }
        };
    };
    
    const handleOtpSubmit = () => {
        submitting = true;
        return async ({ result }) => {
            submitting = false;
            if (result.type === 'redirect') {
                goto(result.location);
            } else if (result.type === 'failure') {
                error = result.data?.message || 'Invalid code';
            }
        };
    };
</script>

<div class="auth-page">
    <img src="/footer.png" alt="" class="auth-bg" />
    
    <div class="auth-content">
        <div class="auth-card">
            <h1>Hey! Welcome to BuildBoard!</h1>
            
            {#if showOtpForm}
                <p class="subtitle">Check your email for a login code</p>
                
                <form method="POST" action="?/verifyOtp" use:enhance={handleOtpSubmit}>
                    <input type="hidden" name="email" value={email} />
                    <input 
                        type="text" 
                        name="otp" 
                        class="input"
                        placeholder="Enter your code"
                        required 
                        autofocus
                        autocomplete="one-time-code"
                        disabled={submitting}
                    />
                    <button type="submit" class="btn" disabled={submitting}>
                        {submitting ? 'Verifying...' : 'Log in'}
                    </button>
                </form>
                
                <p class="back-link">
                    <a href="/auth/login">← Use a different email</a>
                </p>
            {:else}
                <p class="subtitle">If you don't already have an account, we'll make one for you</p>
                
                <form method="POST" action="?/sendCode" use:enhance={handleEmailSubmit}>
                    <input 
                        type="email" 
                        name="email" 
                        class="input"
                        placeholder="Your email"
                        required 
                        autofocus
                        disabled={submitting}
                    />
                    <button type="submit" class="btn" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send login code'}
                    </button>
                </form>
            {/if}
            
            {#if error}
                <p class="error">{error}</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .auth-page {
        position: relative;
        min-height: 100vh;
        width: 100%;
        background: var(--bb-bg-dark);
        overscroll-behavior: none;
        -webkit-overflow-scrolling: auto;
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
        margin: 0 0 1.5rem 0;
        font-size: 1rem;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .input {
        padding: 0.75rem 1rem;
        font-size: 1.125rem;
        border: 2px solid var(--bb-primary);
        background: rgba(255, 184, 89, 0.05);
        color: var(--bb-text-primary);
        outline: none;
        font-family: inherit;
    }

    .input::placeholder {
        color: var(--bb-text-muted);
    }

    .input:focus {
        background: rgba(255, 184, 89, 0.1);
        border-color: var(--bb-primary-light);
    }

    .input:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn {
        padding: 0.75rem 1rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--bb-bg-dark);
        background: var(--bb-primary);
        border: 2px solid var(--bb-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    .btn:hover:not(:disabled) {
        background: var(--bb-primary-light);
        border-color: var(--bb-primary-light);
    }

    .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .error {
        color: var(--bb-accent);
        margin: 1rem 0 0 0;
        font-size: 0.875rem;
    }

    .back-link {
        margin: 1.5rem 0 0 0;
    }

    .back-link a {
        color: var(--bb-text-secondary);
        text-decoration: none;
        font-size: 0.875rem;
    }

    .back-link a:hover {
        color: var(--bb-primary);
        text-decoration: underline;
    }

    .faq-section {
        margin-top: 4rem;
        padding: 2rem;
        max-width: 72rem;
        width: 100%;
    }

    .faq-title {
        font-size: 2.5rem;
        text-align: center;
        margin-bottom: 2rem;
        color: var(--bb-text-primary);
    }

    .faq-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
    }

    .faq-item {
        text-align: center;
        background: rgba(0, 0, 0, 0.3);
        padding: 1.5rem;
        backdrop-filter: blur(4px);
    }

    .faq-question {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--bb-primary);
        margin-bottom: 0.5rem;
    }

    .faq-answer {
        font-size: 0.9375rem;
        color: var(--bb-text-secondary);
        line-height: 1.5;
    }

    .footer-bottom {
        margin-top: auto;
        padding: 2rem;
        width: 100%;
        background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%);
    }

    .footer-bottom-inner {
        max-width: 72rem;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
    }

    .footer-left {
        flex-shrink: 0;
    }

    .footer-attribution {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--bb-text-primary);
    }

    .footer-attribution a {
        color: var(--bb-link);
        text-decoration: underline;
        transition: color 0.2s;
    }

    .footer-attribution a:hover {
        color: var(--bb-link-hover);
    }

    .footer-description {
        color: var(--bb-text-secondary);
        font-size: 0.875rem;
        max-width: 24rem;
    }

    .footer-links {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .footer-col {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .footer-col-title {
        font-size: 1rem;
        font-weight: 600;
        margin-right: 0.5rem;
        color: var(--bb-text-primary);
    }

    .footer-col a {
        color: var(--bb-text-primary);
        font-size: 0.875rem;
        text-decoration: none;
        transition: color 0.2s;
    }

    .footer-col a::before {
        content: "•";
        margin-right: 0.5rem;
        opacity: 0.5;
    }

    .footer-col a:hover {
        color: var(--bb-primary);
    }

    @media (max-width: 480px) {
        .auth-card {
            padding: 1.5rem;
        }
    }

    @media (max-width: 640px) {
        .auth-content {
            padding: 2rem 1rem 1rem;
        }

        .faq-section {
            margin-top: 2rem;
            padding: 1rem;
        }

        .faq-title {
            font-size: 1.75rem;
        }

        .faq-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }

        .faq-item {
            text-align: left;
        }

        .footer-bottom-inner {
            flex-direction: column;
        }

        .footer-links {
            gap: 1rem;
        }
    }

    @media (min-width: 641px) and (max-width: 1024px) {
        .faq-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>

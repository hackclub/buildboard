<script>
    import { goto } from '$app/navigation';

    let { 
        headerText = "Get started with BuildBoard!", 
        placeholder = "your@email.com",
        buttonText = "Get started"
    } = $props();
    
    let submitting = $state(false);
    let email = $state('');

    /** @param {SubmitEvent} e */
    async function handleSubmit(e) {
        e.preventDefault();
        if (!email) return;
        
        submitting = true;
        goto(`/auth/login?email=${encodeURIComponent(email)}`);
    }
</script>

<div class="email-signup-container">
    <p class="header-text">{headerText}</p>
    <form class="email-form" onsubmit={handleSubmit}>
        <div class="input-wrapper">
            <input 
                type="email" 
                name="email" 
                bind:value={email}
                {placeholder}
                required 
                autocomplete="email" 
                class="email-input"
                disabled={submitting}
            />
            <button 
                type="submit" 
                class="submit-button"
                disabled={submitting}
            >
                {submitting ? '...' : buttonText}
            </button>
        </div>
    </form>
</div>

<style>
    .email-signup-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 3rem 2rem;
        background-color: var(--bb-accent);
        border: 2px solid var(--bb-text-primary);
        max-width: 28rem;
        width: 100%;
    }

    .header-text {
        font-size: 1.25rem;
        color: var(--bb-text-primary);
        text-align: center;
        margin: 0;
    }

    .email-form {
        width: 100%;
    }

    .input-wrapper {
        display: flex;
        width: 100%;
    }

    .email-input {
        flex: 1;
        min-width: 0;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        border: 2px solid var(--bb-text-primary);
        border-right: none;
        background: var(--bb-text-primary);
        color: var(--bb-accent);
        outline: none;
        font-family: inherit;
    }

    .email-input::placeholder {
        color: #718096;
    }

    .email-input:focus {
        outline: none;
    }

    .email-input:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .submit-button {
        padding: 0.5rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--bb-accent);
        background-color: var(--bb-text-primary);
        border: 2px solid var(--bb-text-primary);
        border-left: none;
        cursor: pointer;
        transition: background-color 0.2s ease;
        white-space: nowrap;
        font-family: inherit;
    }

    .submit-button:hover:not(:disabled) {
        background-color: var(--bb-primary-light);
        border-color: var(--bb-primary-light);
    }

    .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    @media (max-width: 480px) {
        .email-signup-container {
            padding: 1rem 1.5rem 1.5rem;
        }

        .input-wrapper {
            flex-direction: column;
        }

        .email-input {
            border-right: 2px solid var(--bb-text-primary);
            border-bottom: none;
        }

        .submit-button {
            border-left: 2px solid var(--bb-text-primary);
            width: 100%;
        }
    }
</style>

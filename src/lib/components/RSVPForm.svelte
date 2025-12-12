<script>
    import { enhance } from '$app/forms';

    let { message = $bindable(null), isHovered = $bindable(false) } = $props();
    /** @type {any} */
    let timeoutId;
    let submitting = $state(false);

    const handleSubmit = () => {
        submitting = true;
        /** @param {{ result: import('@sveltejs/kit').ActionResult }} param0 */
        return async ({ result }) => {
            submitting = false;
            // console.log('RSVP Result:', result);
            if (timeoutId) clearTimeout(timeoutId);

            if (result.type === 'failure') {
                if (result.status === 422 || result.status === 429) {
                    message = { text: 'Too many requests', type: 'error' };
                } else {
                    // @ts-ignore
                    message = { text: result.data?.message || 'Error', type: 'error' };
                }
            } else if (result.type === 'success') {
                console.log('New RSVP sent');
                // @ts-ignore
                if (result.data?.collision) {
                    message = { text: "you've already done it", type: 'error' };
                } else {
                    message = { text: 'it was successful', type: 'success' };
                }
            } else if (result.type === 'error') {
                message = { text: 'An unexpected error occurred', type: 'error' };
            }
            
            if (message) {
                timeoutId = setTimeout(() => {
                    message = null;
                }, 3000);
            }
        };
    };
</script>

<div class="rsvp-container">
    <form method="POST" action="?/rsvp" class="rsvp-form" use:enhance={handleSubmit}>
        <div class="input-wrapper">
            <input type="email" name="email" placeholder="your email" required autocomplete="email" class="email-input text-white" disabled={submitting} />
            <button 
                type="submit" 
                class="submit-button"
                onmouseenter={() => isHovered = true}
                onmouseleave={() => isHovered = false}
                disabled={submitting}
            >submit </button>
        </div>
    </form>
</div>

<style>
    /* Container anchors the form and controls max width */
    .rsvp-container {
        width: 100%;
        max-width: 25rem; /* Reduced width */
        padding: 0 1rem;  /* Prevent touching edges on small screens */
        box-sizing: border-box;
        position: relative;
    }

    /* The wrapper uses Flexbox to align input and button */
    .input-wrapper {
        display: flex;
        gap: 0.5rem;
        align-items: center; /* Center items vertically to handle rotation nicely */
        /* On extremely small screens, we might want to wrap, but for an email field + button, row is usually fine. 
           We can use media queries to switch to column if needed. */
    }

    .email-input {
        flex: 1; /* Take up all available space */
        min-width: 0; /* Critical for flex items to shrink properly */
        padding: 0.75rem 1rem;
        font-size: 1.5rem; /* Increased font size */
        border: none; /* Remove border */
        border-radius: 0;
        background: transparent; /* Transparent background */
        backdrop-filter: none;   /* Remove blur */
        transition: all 0.2s ease;
        
        /* "Frown" effect part 1: Tilt left side up */
        /* Adding a slight skew to make the text feel 'bent' with the container */
        transform: rotate(-2deg) skewX(-2deg) translateY(3px);
    }

    .email-input:focus {
        outline: none;
        border: none;
        background: transparent; /* Keep transparent on focus */
        box-shadow: none; /* Remove shadow on focus to keep it clean */
    }
    
    /* ... */

    .submit-button {
        padding: 0.75rem 1rem; /* Reduced horizontal padding */
        font-size: 1.5rem; /* Increased font size */
        font-weight: 600;
        color: transparent; /* Text transparent (invisible) */
        background-color: transparent; /* Transparent background */
        border: none; /* Remove border */
        border-radius: 0;
        cursor: pointer;
        transition: none; /* Remove transition for invisible button */
        white-space: nowrap; /* Ensure text doesn't wrap awkwardly */
        
        /* "Frown" effect part 2: Tilt right side down (relative to center peak) */
        /* Adding skew to match the input's distortion style */
        transform: rotate(2deg) skewX(2deg) translateY(3px);
    }

    .submit-button:hover {
        background-color: transparent;
        color: transparent;
        /* Maintain exact same position (no hover effect) */
        transform: rotate(2deg) skewX(2deg) translateY(3px);
    }

    .submit-button:active {
        transform: rotate(2deg) skewX(2deg) translateY(3px) scale(0.98);
    }

    .submit-button:disabled {
        cursor: not-allowed;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
        .input-wrapper {
            flex-direction: column;
        }
        
        .submit-button {
            width: 100%;
        }
    }
</style>

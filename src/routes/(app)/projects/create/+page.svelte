<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";

    let loading = false;
    let error = "";

    const type = $page.url.searchParams.get("type") || "wildcard";
    let title = "";
    let description = "";

    const typeLabels: Record<string, string> = {
        website: "Website",
        game: "Game",
        mobile: "Mobile App",
        cli: "Terminal CLI",
        desktop: "Desktop App",
        wildcard: "Project",
    };

    const typeIcons: Record<string, string> = {
        website: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
        game: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
        mobile: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
        cli: "M4 17l6-6-6-6M12 19h8",
        desktop: "M2 3h20v14H2zM8 21h8M12 17v4",
        wildcard: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    };

    async function handleSubmit() {
        if (!title || !description) {
            error = "Please fill in all fields";
            return;
        }

        loading = true;
        error = "";

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectTitle: title,
                    projectDescription: description,
                    projectType: type,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create project");
            }

            await goto("/projects");
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }
</script>

<div class="page-container">
    <!-- Back Link -->
    <a href="/projects/select" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to selection
    </a>

    <!-- Header -->
    <header class="page-header">
        <div class="type-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d={typeIcons[type] || typeIcons.wildcard} />
            </svg>
        </div>
        <div class="header-content">
            <h1>Create your {typeLabels[type] || "Project"}</h1>
            <p>Tell us about what you're building</p>
        </div>
    </header>

    <!-- Form Card -->
    <div class="card">
        {#if error}
            <div class="form-error">{error}</div>
        {/if}

        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-group">
                <label for="title">Project Name</label>
                <input
                    id="title"
                    type="text"
                    bind:value={title}
                    placeholder="My Awesome Project"
                    maxlength="30"
                />
                <span class="char-count">{title.length}/30</span>
            </div>

            <div class="form-group">
                <label for="description">Description</label>
                <textarea
                    id="description"
                    bind:value={description}
                    placeholder="What are you building? What problem does it solve?"
                    maxlength="300"
                    rows="4"
                ></textarea>
                <span class="char-count">{description.length}/300</span>
            </div>

            <button
                type="submit"
                class="btn-primary"
                disabled={loading}
            >
                {#if loading}
                    <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Creating...
                {:else}
                    Create Project
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                {/if}
            </button>
        </form>
    </div>
</div>

<style>
    .page-container {
        max-width: 560px;
        margin: 0 auto;
        padding: 0 1rem 3rem;
    }

    /* Back Link */
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
        font-size: 0.9rem;
        text-decoration: none;
        margin-bottom: 1.5rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--bb-primary);
    }

    /* Header */
    .page-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .type-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: rgba(255, 184, 89, 0.15);
        border: 1px solid rgba(255, 184, 89, 0.3);
        border-radius: 0;
        color: var(--bb-primary);
    }

    .header-content h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.25rem;
    }

    .header-content p {
        font-size: 0.9rem;
        color: var(--bb-text-muted);
        margin: 0;
    }

    /* Card */
    .card {
        background: rgba(46, 34, 33, 0.95);
        border-radius: 0;
        padding: 2rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    }

    /* Form */
    .form-group {
        margin-bottom: 1.5rem;
        position: relative;
    }

    .form-group label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
        color: var(--bb-text-primary);
        font-size: 0.95rem;
        font-family: inherit;
        transition: border-color 0.2s;
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
        color: var(--bb-text-muted);
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--bb-primary);
    }

    .form-group textarea {
        resize: vertical;
        min-height: 100px;
    }

    .char-count {
        position: absolute;
        right: 0;
        bottom: -1.25rem;
        font-size: 0.75rem;
        color: var(--bb-text-muted);
    }

    .form-error {
        padding: 0.75rem 1rem;
        background: rgba(127, 29, 29, 0.3);
        border: 1px solid rgba(185, 28, 28, 0.5);
        border-radius: 0;
        color: #fca5a5;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
    }

    /* Button */
    .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.875rem 1.5rem;
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 1rem;
        border: none;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .spinner {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 640px) {
        .card {
            padding: 1.5rem 1.25rem;
        }

        .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
        }

        .header-content h1 {
            font-size: 1.25rem;
        }
    }
</style>

<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    export let projectName: string;
    export let projectId: string;
    export let isOpen = false;
    
    const dispatch = createEventDispatcher();
    
    let confirmed = false;
    let deleting = false;
    let error = '';
    
    function close() {
        if (deleting) return;
        isOpen = false;
        confirmed = false;
        error = '';
        dispatch('close');
    }
    
    async function deleteProject() {
        if (!confirmed) return;
        
        deleting = true;
        error = '';
        
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE'
            });
            
            if (!res.ok && res.status !== 204) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to delete project');
            }
            
            dispatch('deleted');
        } catch (e: any) {
            error = e.message;
            deleting = false;
        }
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            close();
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
    <div class="modal-overlay" on:click={close} on:keydown={(e) => e.key === 'Enter' && close()} role="button" tabindex="0">
        <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div class="modal-header">
                <h2 id="modal-title">Delete Project</h2>
                <button class="close-btn" on:click={close} disabled={deleting} aria-label="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div class="modal-body">
                <p class="warning-text">
                    Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone.
                </p>
                
                <label class="confirm-checkbox">
                    <input type="checkbox" bind:checked={confirmed} disabled={deleting} />
                    <span>I understand this will permanently delete this project and all its data.</span>
                </label>
                
                {#if error}
                    <div class="error-message">{error}</div>
                {/if}
            </div>
            
            <div class="modal-footer">
                <button class="btn-secondary" on:click={close} disabled={deleting}>Cancel</button>
                <button 
                    class="btn-danger" 
                    on:click={deleteProject} 
                    disabled={!confirmed || deleting}
                >
                    {#if deleting}
                        Deleting...
                    {:else}
                        Delete Project
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
    }
    
    .modal {
        background: var(--bb-bg-card, #1a1a2e);
        border: 1px solid var(--bb-accent-dark, #333);
        border-radius: 0;
        width: 100%;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    
    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid var(--bb-accent-dark, #333);
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--bb-text-primary, #fff);
    }
    
    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        border: none;
        border-radius: 0;
        color: var(--bb-text-muted, #888);
        cursor: pointer;
        transition: color 0.2s;
    }
    
    .close-btn:hover:not(:disabled) {
        color: var(--bb-text-primary, #fff);
    }
    
    .close-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .modal-body {
        padding: 1.25rem;
    }
    
    .warning-text {
        margin: 0 0 1rem;
        font-size: 0.9rem;
        color: var(--bb-text-secondary, #ccc);
        line-height: 1.5;
    }
    
    .warning-text strong {
        color: var(--bb-text-primary, #fff);
    }
    
    .confirm-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        cursor: pointer;
    }
    
    .confirm-checkbox input {
        margin-top: 0.15rem;
        width: 16px;
        height: 16px;
        cursor: pointer;
        accent-color: #ef4444;
    }
    
    .confirm-checkbox span {
        font-size: 0.85rem;
        color: var(--bb-text-muted, #888);
        line-height: 1.4;
    }
    
    .error-message {
        margin-top: 1rem;
        padding: 0.65rem 0.875rem;
        background: rgba(127, 29, 29, 0.3);
        border: 1px solid rgba(185, 28, 28, 0.5);
        border-radius: 0;
        color: #fca5a5;
        font-size: 0.85rem;
    }
    
    .modal-footer {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding: 1rem 1.25rem;
        border-top: 1px solid var(--bb-accent-dark, #333);
    }
    
    .btn-secondary {
        padding: 0.6rem 1rem;
        background: transparent;
        color: var(--bb-text-secondary, #ccc);
        font-weight: 500;
        font-size: 0.85rem;
        border: 1px solid var(--bb-accent-dark, #333);
        border-radius: 0;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-primary, #fff);
    }
    
    .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    
    .btn-danger {
        padding: 0.6rem 1rem;
        background: #dc2626;
        color: #fff;
        font-weight: 600;
        font-size: 0.85rem;
        border: none;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-danger:hover:not(:disabled) {
        background: #b91c1c;
    }
    
    .btn-danger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>

<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    
    let { children } = $props();
    $: platformEnabled = $page.data.flags?.enablePlatform;
    
    $effect(() => {
        if (browser && !platformEnabled) {
            goto('/');
        }
    });
</script>

{#if platformEnabled}
    {@render children?.()}
{/if}

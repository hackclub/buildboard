<script>
    import { useFlag } from '@unleash/proxy-client-svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    
    let { children } = $props();
    const platformEnabled = useFlag('enable-platform');
    
    $effect(() => {
        if (browser && !$platformEnabled) {
            goto('/');
        }
    });
</script>

{#if $platformEnabled}
    {@render children?.()}
{/if}

<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    onMount(() => {
        goto('/app/projects');
    });
</script>

<p>Redirecting...</p>

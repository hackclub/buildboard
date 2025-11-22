<script>
    import RSVPLanding from '$lib/components/RSVPLanding.svelte';
	import { useFlag } from '@unleash/proxy-client-svelte';

	const enabled = useFlag('enable-platform');
</script>

<section>
    <p>
        {$enabled ? 'Feature is enabled!' : 'Feature is disabled!'}
    </p>
</section>

<RSVPLanding />

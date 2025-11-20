<script lang="ts">
	import '../app.css';
	import { FlagProvider } from '@unleash/proxy-client-svelte';
	import { env } from '$env/dynamic/public';

	let { children } = $props();

	const config = {
		url: env.PUBLIC_UNLEASH_URL || 'http://localhost:4242/api/frontend',
		clientKey: env.PUBLIC_UNLEASH_CLIENT_KEY || 'default:development.unleash-insecure-frontend-token',
		refreshInterval: 15,
		appName: 'buildboard'
	};

	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let tooSmall = $derived(innerWidth < 1345 || innerHeight < 790);

	import { onMount } from 'svelte';

	onMount(() => {
		const updateSize = () => {
			innerWidth = window.innerWidth;
			innerHeight = window.innerHeight;
		};

		updateSize();

		window.addEventListener('resize', updateSize);

		return () => {
			window.removeEventListener('resize', updateSize);
		};
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/back.png" />
	<title> Buildboard </title>
</svelte:head>


<FlagProvider {config}>
	{@render children?.()}
</FlagProvider>

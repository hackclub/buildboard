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
	<title>Buildboard - Immortalize your project</title>
	<meta name="description" content="Buildboard is a program that immortalizes Hack Clubbers’ projects. Ship your passion project, document the journey, and get featured on a billboard in NYC or near you. This is your time to show the whole world." />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Buildboard - Immortalize your project" />
	<meta property="og:description" content="Buildboard is a program that immortalizes Hack Clubbers’ projects. Ship your passion project, document the journey, and get featured on a billboard in NYC or near you. This is your time to show the whole world." />
	<meta property="og:image" content="https://assets.hackclub.com/flag-orpheus-top.png" />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content="Buildboard - Immortalize your project" />
	<meta property="twitter:description" content="Buildboard is a program that immortalizes Hack Clubbers’ projects. Ship your passion project, document the journey, and get featured on a billboard in NYC or near you. This is your time to show the whole world." />
	<meta property="twitter:image" content="https://assets.hackclub.com/flag-orpheus-top.png" />
</svelte:head>


<FlagProvider {config}>
	{@render children?.()}
</FlagProvider>

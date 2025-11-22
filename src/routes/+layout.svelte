<script lang="ts">
	import '../app.css';
	import { env } from '$env/dynamic/public';

	let { children, data } = $props();
	
	let innerWidth = $state(0);
	let innerHeight = $state(0);
	let tooSmall = $derived(innerWidth < 1345 || innerHeight < 790);

	import { onMount } from 'svelte';

	onMount(() => {
		const updateSize = () => {
			if (typeof window !== 'undefined') {
				innerWidth = window.innerWidth;
				innerHeight = window.innerHeight;
			}
		};

		if (typeof window !== 'undefined') {
			updateSize();

			window.addEventListener('resize', updateSize);

			return () => {
				window.removeEventListener('resize', updateSize);
			};
		}
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


{@render children?.()}

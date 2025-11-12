<script lang="ts">
	import '../app.css';
	let { children } = $props();

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


{@render children?.()}

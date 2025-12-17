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
	<!-- Primary Meta Tags -->
	<link rel="icon" type="image/png" href="/buildboard-favicon.png" />
	<link rel="canonical" href="https://buildboard.hackclub.com" />
	<title>BuildBoard - Ship Your Project, Get Featured on a Billboard | Hack Club</title>
	<meta name="title" content="BuildBoard - Ship Your Project, Get Featured on a Billboard | Hack Club" />
	<meta name="description" content="BuildBoard immortalizes teen makers' projects. Ship your passion project, log 30+ hours, and get featured on a billboard in NYC. Join thousands of Hack Clubbers building cool stuff." />
	<meta name="keywords" content="Hack Club, BuildBoard, teen coding, student projects, programming, billboard, NYC, maker, shipping projects, GitHub, Hackatime, coding challenge" />
	<meta name="author" content="Hack Club" />
	<meta name="robots" content="index, follow" />
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://buildboard.hackclub.com" />
	<meta property="og:site_name" content="BuildBoard by Hack Club" />
	<meta property="og:title" content="BuildBoard - Ship Your Project, Get Featured on a Billboard" />
	<meta property="og:description" content="BuildBoard immortalizes teen makers' projects. Ship your passion project, log 30+ hours, and get featured on a billboard in NYC. Join thousands of Hack Clubbers building cool stuff." />
	<meta property="og:image" content="https://assets.hackclub.com/flag-orpheus-top.png" />
	<meta property="og:image:alt" content="BuildBoard by Hack Club" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@hackclub" />
	<meta name="twitter:creator" content="@hackclub" />
	<meta name="twitter:title" content="BuildBoard - Ship Your Project, Get Featured on a Billboard" />
	<meta name="twitter:description" content="BuildBoard immortalizes teen makers' projects. Ship your passion project, log 30+ hours, and get featured on a billboard in NYC. Join thousands of Hack Clubbers building cool stuff." />
	<meta name="twitter:image" content="https://assets.hackclub.com/flag-orpheus-top.png" />

	<!-- Additional SEO Tags -->
	<meta name="theme-color" content="#e94560" />
	<meta name="apple-mobile-web-app-title" content="BuildBoard" />
	<meta name="application-name" content="BuildBoard" />

	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "BuildBoard",
		"description": "BuildBoard immortalizes teen makers' projects. Ship your passion project, log 30+ hours, and get featured on a billboard in NYC.",
		"url": "https://buildboard.hackclub.com",
		"applicationCategory": "EducationalApplication",
		"operatingSystem": "Web",
		"offers": {
			"@type": "Offer",
			"price": "0",
			"priceCurrency": "USD"
		},
		"creator": {
			"@type": "Organization",
			"name": "Hack Club",
			"url": "https://hackclub.com",
			"logo": "https://assets.hackclub.com/flag-orpheus-top.png",
			"sameAs": [
				"https://twitter.com/hackclub",
				"https://github.com/hackclub",
				"https://www.instagram.com/hackclub"
			]
		},
		"audience": {
			"@type": "EducationalAudience",
			"educationalRole": "student",
			"audienceType": "Teenagers"
		}
	}
	</script>`}
</svelte:head>


{@render children?.()}

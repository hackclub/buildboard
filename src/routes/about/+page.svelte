<script lang="ts">
</script>

<svelte:head>
	<title>About BuildBoard | Hack Club Project Showcase Platform</title>
	<meta name="description" content="Learn about BuildBoard, the Hack Club platform that celebrates teen makers. Ship your project, log your coding hours, and earn a spot on a real billboard in NYC." />
	<meta property="og:title" content="About BuildBoard | Hack Club Project Showcase Platform" />
	<meta property="og:description" content="Learn about BuildBoard, the Hack Club platform that celebrates teen makers. Ship your project, log your coding hours, and earn a spot on a real billboard in NYC." />
	<meta property="og:url" content="https://buildboard.hackclub.com/about" />
	<meta name="twitter:title" content="About BuildBoard | Hack Club Project Showcase Platform" />
	<meta name="twitter:description" content="Learn about BuildBoard, the Hack Club platform that celebrates teen makers. Ship your project, log your coding hours, and earn a spot on a real billboard in NYC." />
	<link rel="canonical" href="https://buildboard.hackclub.com/about" />

	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "AboutPage",
		"name": "About BuildBoard",
		"description": "Learn about BuildBoard, the Hack Club platform that celebrates teen makers.",
		"url": "https://buildboard.hackclub.com/about",
		"mainEntity": {
			"@type": "Organization",
			"name": "Hack Club",
			"url": "https://hackclub.com"
		}
	}
	</script>`}
</svelte:head>

<div class="about-page">
	<div class="content">
		<h1>About BuildBoard</h1>
		
		<section class="intro">
			<p>BuildBoard is a program by <a href="https://hackclub.com" target="_blank" rel="noopener">Hack Club</a> that immortalizes teen makers' projects.</p>
		</section>

		<section class="how-it-works">
			<h2>How It Works</h2>
			<ol>
				<li><strong>Connect your tools</strong> - Link your GitHub repository and Hackatime to track your coding progress.</li>
				<li><strong>Build your project</strong> - Work on your passion project and log at least 30 hours of coding time.</li>
				<li><strong>Ship it</strong> - Submit your completed project for review by the community.</li>
				<li><strong>Get featured</strong> - Approved projects get showcased on a real billboard in NYC!</li>
			</ol>
		</section>

		<section class="why">
			<h2>Why BuildBoard?</h2>
			<p>We believe every young maker deserves recognition for their hard work. BuildBoard gives you a platform to showcase your projects to the world—literally. Your code could be displayed on a billboard in Times Square.</p>
		</section>

		<section class="community">
			<h2>Join the Community</h2>
			<p>BuildBoard is part of the <a href="https://hackclub.com" target="_blank" rel="noopener">Hack Club</a> ecosystem, a global network of thousands of teen coders building amazing things. Join us on <a href="https://hackclub.com/slack" target="_blank" rel="noopener">Slack</a> to connect with other builders.</p>
		</section>
	</div>
</div>

<style>
	.about-page {
		font-family: 'brisbane', sans-serif;
		background: #a63c2a url('/footer.png') no-repeat center bottom;
		background-size: cover;
		background-attachment: fixed;
		color: #1e1e1e;
		min-height: 100vh;
	}

	.content {
		max-width: 800px;
		margin: 0 auto;
		padding: 60px 40px;
	}

	h1 {
		color: #5a3020;
		font-size: 42px;
		font-weight: 300;
		margin: 0 0 32px 0;
	}

	h2 {
		color: #1e1e1e;
		font-size: 24px;
		font-weight: 600;
		margin: 40px 0 16px 0;
	}

	section {
		margin-bottom: 32px;
	}

	p {
		font-size: 18px;
		line-height: 1.7;
		margin: 0 0 16px 0;
	}

	ol {
		padding-left: 24px;
		margin: 0;
	}

	li {
		font-size: 18px;
		line-height: 1.7;
		margin-bottom: 12px;
	}

	a {
		color: #5a3020;
		text-decoration: underline;
	}

	a:hover {
		color: #3d2015;
	}

	@media (max-width: 600px) {
		.content {
			padding: 40px 20px;
		}

		h1 {
			font-size: 32px;
		}
	}
</style>

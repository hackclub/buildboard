<script lang="ts">
	import { faqSections } from '$lib/data/faq';
</script>

<svelte:head>
	<title>FAQ - BuildBoard | Frequently Asked Questions</title>
	<meta name="description" content="Find answers to common questions about BuildBoard. Learn how to submit projects, eligibility requirements, billboard locations, and more." />
	<meta property="og:title" content="FAQ - BuildBoard | Frequently Asked Questions" />
	<meta property="og:description" content="Find answers to common questions about BuildBoard. Learn how to submit projects, eligibility requirements, billboard locations, and more." />
	<meta property="og:url" content="https://buildboard.hackclub.com/faq" />
	<meta name="twitter:title" content="FAQ - BuildBoard | Frequently Asked Questions" />
	<meta name="twitter:description" content="Find answers to common questions about BuildBoard. Learn how to submit projects, eligibility requirements, billboard locations, and more." />
	<link rel="canonical" href="https://buildboard.hackclub.com/faq" />

	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": [
			{
				"@type": "Question",
				"name": "What is BuildBoard?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "BuildBoard is a program that immortalizes Hack Clubbers' projects. Ship your passion project, document the journey, and get featured on a billboard in NYC or near you."
				}
			},
			{
				"@type": "Question",
				"name": "Who is eligible to participate?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "BuildBoard is open to all Hack Club members and young makers who have built a project they're proud of. Whether you're a beginner or experienced developer, if you've created something meaningful, we want to see it!"
				}
			},
			{
				"@type": "Question",
				"name": "How do I submit my project?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "To submit your project, log into your BuildBoard account and navigate to the submission page. You'll need to provide details about your project, upload images or videos, and share the story behind what you built."
				}
			},
			{
				"@type": "Question",
				"name": "Where will the billboard be located?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "Our primary billboard is located in New York City, but we're expanding to additional locations. Check our announcements for the latest billboard locations near you."
				}
			},
			{
				"@type": "Question",
				"name": "How are projects selected for the billboard?",
				"acceptedAnswer": {
					"@type": "Answer",
					"text": "Projects are reviewed by our team based on creativity, effort, impact, and how well they represent the maker spirit. We aim to showcase a diverse range of projects from our community."
				}
			}
		]
	}
	</script>`}
</svelte:head>

<div class="faq-page">
	<div class="content">
		<h1>Frequently Asked Questions</h1>
		<p class="intro">Find the answers to common questions about Buildboard.</p>

		<div class="sections-grid">
			{#each faqSections as section}
				<section class="faq-section">
					<h2>{section.title}</h2>
					<ul>
						{#each section.questions as q}
							<li>
								<a href="/faq/{section.slug}/{q.slug}">{q.question}</a>
							</li>
						{/each}
					</ul>
					<a href="/faq/{section.slug}" class="more-link">More &gt;</a>
				</section>
			{/each}
		</div>
	</div>
</div>

<style>
	.faq-page {
		font-family: 'brisbane', sans-serif !important;
		background: #a63c2a url('/footer.png') no-repeat center bottom;
		background-size: cover;
		background-attachment: fixed;
		color: #1e1e1e;
		min-height: 100vh;
		position: relative;
	}

	.faq-page * {
		font-family: 'brisbane', sans-serif !important;
	}

	.faq-page h1 {
		color: #5a3020;
		font-size: 36px;
		font-weight: 300;
		margin: 0 0 16px 0;
		padding: 0;
	}

	.content {
		max-width: 1200px;
		margin: 0 auto 0 0;
		padding: 40px 60px;
	}

	.intro {
		font-size: 16px;
		font-weight: 400;
		color: #1e1e1e;
		margin-bottom: 40px;
	}

	.sections-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 40px 60px;
	}

	.faq-section {
		margin-bottom: 20px;
	}

	.faq-section h2 {
		font-size: 20px;
		font-weight: 600;
		color: #1e1e1e;
		margin: 0 0 16px 0;
		padding-bottom: 0;
		border: none;
	}

	.faq-section ul {
		list-style: none;
		padding: 0;
		margin: 0 0 16px 0;
	}

	.faq-section li {
		margin-bottom: 12px;
		line-height: 1.5;
	}

	.faq-section a {
		color: #1e1e1e;
		text-decoration: none;
		font-size: 14px;
		font-weight: 400;
	}

	.faq-section a:hover {
		text-decoration: underline;
	}

	.more-link {
		color: #1e1e1e;
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
	}

	.more-link:hover {
		text-decoration: underline;
	}

	@media (max-width: 900px) {
		.sections-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 600px) {
		.sections-grid {
			grid-template-columns: 1fr;
		}

		.content {
			padding: 30px 20px;
		}
	}
</style>

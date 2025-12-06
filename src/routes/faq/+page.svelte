<script lang="ts">
	import { faqSections } from '$lib/data/faq';
</script>

<div class="faq-page">
	<div class="hero">
		<div class="hero-content">
			<h1>Frequently Asked Questions</h1>
		</div>
	</div>

	<div class="content">
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
		background-color: #fff;
		color: #1e1e1e;
		min-height: 100vh;
	}

	.faq-page * {
		font-family: 'brisbane', sans-serif !important;
	}

	.hero {
		background-color: #866d00;
		padding: 40px 0;
		margin: 0;
	}

	.hero-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 60px;
	}

	.hero h1 {
		color: #fff;
		font-size: 36px;
		font-weight: 300;
		margin: 0;
		padding: 0;
	}

	.content {
		max-width: 1200px;
		margin: 0 auto;
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

		.hero {
			padding: 30px 20px;
		}

		.content {
			padding: 30px 20px;
		}

		.hero h1 {
			font-size: 28px;
		}
	}
</style>

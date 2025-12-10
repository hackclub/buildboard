<script lang="ts">
	let { data } = $props();
</script>

<div class="faq-answer-page">
	<div class="content">
		<a href="/faq" class="back-link">← Back</a>
		
		<div class="breadcrumb">
			<span class="breadcrumb-line"></span>
			<span class="breadcrumb-text">FAQ</span>
		</div>
		
		<h1>{data.question.question}</h1>
		
		<p class="answer">{data.question.answer}</p>
	</div>
</div>

<style>
	.faq-answer-page {
		font-family: 'brisbane', sans-serif !important;
		background: #a63c2a url('/footer.png') no-repeat center bottom;
		background-size: cover;
		background-attachment: fixed;
		color: #1e1e1e;
		min-height: 100vh;
	}

	.faq-answer-page * {
		font-family: 'brisbane', sans-serif !important;
	}

	.content {
		max-width: 900px;
		margin: 0 auto;
		padding: 60px;
	}

	.back-link {
		display: inline-block;
		color: #1e1e1e;
		text-decoration: none;
		font-size: 16px;
		font-weight: 400;
		margin-bottom: 30px;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.breadcrumb {
		margin-bottom: 20px;
	}

	.breadcrumb-line {
		display: block;
		width: 40px;
		height: 4px;
		background-color: #866d00;
		margin-bottom: 10px;
	}

	.breadcrumb-text {
		font-size: 14px;
		font-weight: 400;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	h1 {
		font-size: 36px;
		font-weight: 300;
		color: #1e1e1e;
		margin: 0 0 30px 0;
		line-height: 1.3;
	}

	.answer {
		font-size: 18px;
		font-weight: 400;
		color: #1e1e1e;
		line-height: 1.7;
		margin: 0;
	}

	@media (max-width: 600px) {
		.content {
			padding: 30px 20px;
		}

		h1 {
			font-size: 28px;
		}

		.answer {
			font-size: 16px;
		}
	}
</style>

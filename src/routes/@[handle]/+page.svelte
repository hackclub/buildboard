<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	{#if data.user}
		<title>{data.user.first_name} {data.user.last_name} (@{data.user.handle}) | BuildBoard Profile</title>
		<meta name="description" content="View {data.user.first_name}'s projects and coding journey on BuildBoard. See their shipped projects and achievements." />
		<meta property="og:title" content="{data.user.first_name} {data.user.last_name} (@{data.user.handle}) | BuildBoard" />
		<meta property="og:description" content="View {data.user.first_name}'s projects and coding journey on BuildBoard. See their shipped projects and achievements." />
		<meta property="og:type" content="profile" />
		<meta property="og:url" content="https://buildboard.hackclub.com/@{data.user.handle}" />
		<meta property="profile:username" content="{data.user.handle}" />
		<meta name="twitter:title" content="{data.user.first_name} {data.user.last_name} (@{data.user.handle}) | BuildBoard" />
		<meta name="twitter:description" content="View {data.user.first_name}'s projects and coding journey on BuildBoard." />
		<link rel="canonical" href="https://buildboard.hackclub.com/@{data.user.handle}" />

		{@html `<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "ProfilePage",
			"mainEntity": {
				"@type": "Person",
				"name": "${data.user.first_name} ${data.user.last_name}",
				"alternateName": "${data.user.handle}",
				"url": "https://buildboard.hackclub.com/@${data.user.handle}"
			}
		}
		</script>`}
	{:else}
		<title>Profile Not Found | BuildBoard</title>
		<meta name="description" content="This BuildBoard profile could not be found or is private." />
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<div class="profile-page">
	{#if data.error}
		<div class="error-container">
			<h1>Profile Not Available</h1>
			<p>{data.error}</p>
			<a href="/" class="back-link">← Back to BuildBoard</a>
		</div>
	{:else if data.user}
		<div class="profile-container">
			<div class="profile-header">
				<div class="avatar">
					<img
						src={`https://ui-avatars.com/api/?name=${data.user.first_name}+${data.user.last_name}&background=random&size=128`}
						alt="{data.user.first_name} {data.user.last_name}"
					/>
				</div>
				<div class="profile-info">
					<h1>{data.user.first_name} {data.user.last_name}</h1>
					<p class="handle">@{data.user.handle}</p>
				</div>
			</div>

			<div class="profile-content">
				<h2>Projects</h2>
				<p class="empty-state">No projects to display yet.</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.profile-page {
		font-family: 'brisbane', sans-serif;
		min-height: 100vh;
		background: #fafaf8;
		color: #1e1e1e;
		padding: 40px;
	}

	.error-container {
		max-width: 600px;
		margin: 100px auto;
		text-align: center;
	}

	.error-container h1 {
		font-size: 32px;
		color: #5a3020;
		margin-bottom: 16px;
	}

	.error-container p {
		font-size: 18px;
		color: #666;
		margin-bottom: 24px;
	}

	.back-link {
		color: #e94560;
		text-decoration: none;
		font-weight: 600;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	.profile-container {
		max-width: 800px;
		margin: 0 auto;
	}

	.profile-header {
		display: flex;
		align-items: center;
		gap: 24px;
		margin-bottom: 40px;
		padding-bottom: 24px;
		border-bottom: 1px solid #eee;
	}

	.avatar img {
		width: 128px;
		height: 128px;
		border-radius: 50%;
		border: 4px solid white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.profile-info h1 {
		font-size: 32px;
		font-weight: 600;
		margin: 0 0 8px 0;
	}

	.handle {
		font-size: 18px;
		color: #666;
		margin: 0;
		font-family: monospace;
	}

	.profile-content h2 {
		font-size: 24px;
		font-weight: 600;
		margin: 0 0 16px 0;
	}

	.empty-state {
		color: #999;
		font-size: 16px;
	}

	@media (max-width: 600px) {
		.profile-page {
			padding: 24px;
		}

		.profile-header {
			flex-direction: column;
			text-align: center;
		}

		.avatar img {
			width: 96px;
			height: 96px;
		}

		.profile-info h1 {
			font-size: 24px;
		}
	}
</style>

<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { PUBLIC_HC_OAUTH_CLIENT_ID, PUBLIC_HC_OAUTH_REDIRECT_URL, PUBLIC_HC_OAUTH_RESPONSE_TYPE, PUBLIC_SLACK_CLIENT_ID, PUBLIC_SLACK_OAUTH_STATE, PUBLIC_SLACK_OAUTH_NONCE, PUBLIC_SLACK_REDIRECT_URI } from '$env/static/public';

    let innerHeight = $state(0);
    let innerWidth = $state(0);
	let tooSmall = $derived(innerWidth < 1610 || innerHeight < 765);
    let smallLayout = $derived(innerWidth > 1200 && innerWidth < 1246);
    let mobileLayout = $derived(innerWidth <= 1200);

    let scaleSignInButton = $state(false);

    let hcaRedirect = `https://hca.dinosaurbbq.org/oauth/authorize?client_id=${PUBLIC_HC_OAUTH_CLIENT_ID}&redirect_uri=${PUBLIC_HC_OAUTH_REDIRECT_URL}&response_type=${PUBLIC_HC_OAUTH_RESPONSE_TYPE}&scope=email`;
    let slackRedirect = `https://slack.com/openid/connect/authorize?response_type=code&scope=openid%20profile%20email&client_id=${PUBLIC_SLACK_CLIENT_ID}&state=${PUBLIC_SLACK_OAUTH_STATE}&nonce=${PUBLIC_SLACK_OAUTH_NONCE}&redirect_uri=${PUBLIC_SLACK_REDIRECT_URI}`

    onMount(() => {
        document.title = "Buildboard - build, present, repeat";
        
        const error = page.url.searchParams.get('error');
        if (error) {
        alert(error);
    }

        const updateSize = () => {
            innerHeight = window.innerHeight;
            innerWidth = window.innerWidth;
        };

        updateSize();

        window.addEventListener('resize', updateSize);

        return () => {
            window.removeEventListener('resize', updateSize);
        };
    });

</script>

{#if mobileLayout}
<div>
    <div class="mobile-image">
        <div class="center-box">
            <button class="go-button">lets go</button>
        </div>
    </div>
    <div class="mobile-section"></div>
</div>
{:else}
<div class="background">
    <div class="center-box">
        <button class="go-button">lets go</button>
    </div>
</div>
{/if}

<style>
    .background {
        position: relative;
        background-image: url('/back.png');
        background-size: cover;
        background-position: center;
        min-height: 100vh;
        width: 100vw;
    }

    .mobile-image {
        position: relative;
        background-image: url('/back.png');
        background-size: cover;
        background-position: center;
        width: 100%;
        min-height: 50vh;
    }

    .mobile-section {
        background-color: lightblue;
        width: 100%;
        min-height: 50vh;
    }

    .center-box {
        position: absolute;
        top: 1000px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        padding: 2rem;
        border-radius: 8px;
    }

    .go-button {
        padding: 1rem 2rem;
        font-size: 1.5rem;
        cursor: pointer;
    }
</style>
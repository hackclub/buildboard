<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { enhance } from '$app/forms';
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
        <div class="button-background"></div>
        <a href={slackRedirect} class="go-button hover:cursor-pointer">lets go</a>
        <form method="POST" action="?/rsvp" class="rsvp-form" use:enhance={() => {
            return async ({ result }) => {
                if (result.type === 'failure') {
                    if (result.status === 422) {
                        alert('Too many requests');
                    } else {
                        alert(result.data?.message || 'Error');
                    }
                } else if (result.type === 'success') {
                    console.log('New RSVP sent');
                    if (result.data?.collision) {
                        alert("email already rsvp'd");
                    } else {
                        alert('RSVP successful!');
                    }
                }
            };
        }}>
            <input type="email" name="email" placeholder="Enter your email" required class="email-input" />
            <button type="submit" class="submit-button">Submit</button>
        </form>
    </div>
    <div class="mobile-section"></div>
</div>
{:else}
<div class="background">
    <div class="button-background"></div>
    <a href={slackRedirect} class="go-button hover:cursor-pointer">lets go</a>
    <form method="POST" action="?/rsvp" class="rsvp-form" use:enhance={() => {
        return async ({ result }) => {
            if (result.type === 'failure') {
                if (result.status === 422) {
                    alert('Too many requests');
                } else {
                    alert(result.data?.message || 'Error');
                }
            } else if (result.type === 'success') {
                console.log('New RSVP sent');
                if (result.data?.collision) {
                    alert("email already rsvp'd");
                } else {
                    alert('RSVP successful!');
                }
            }
        };
    }}>
        <input type="email" name="email" placeholder="Enter your email" required class="email-input" />
        <button type="submit" class="submit-button">Submit</button>
    </form>
</div>
{/if}

<style>
    .background {
        position: relative;
        background-image: url('/bg.png');
        background-size: cover;
        background-position: top center;
        min-height: 100vh;
        width: 100vw;
    }

    .background::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('/email.png');
        background-size: cover;
        background-position: top center;
        pointer-events: none; /* Allow clicking through the overlay */
    }

    .mobile-image {
        position: relative;
        background-image: url('/bg.png');
        background-size: cover;
        background-position: top center;
        width: 100%;
        min-height: 50vh;
    }

    .mobile-image::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('/email.png');
        background-size: cover;
        background-position: top center;
        pointer-events: none;
    }

    .mobile-section {
        background-color: lightblue;
        width: 100%;
        min-height: 50vh;
    }

    .button-background {
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 1);
        padding: 10rem;
        border-radius: 8px;
        z-index: -1;
    }

    .go-button {
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 1rem 2rem;
        font-size: 1.5rem;
        cursor: pointer;
        color: white;
        z-index: 1;
        text-decoration: none;
        display: inline-block;
    }

    .rsvp-form {
        position: absolute;
        top: 85%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
        display: flex;
        gap: 10px;
        width: 80%;
        max-width: 400px;
        justify-content: center;
    }

    .email-input {
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #ccc;
        flex-grow: 1;
    }

    .submit-button {
        padding: 0.5rem 1rem;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .submit-button:hover {
        background-color: rgba(0, 0, 0, 1);
    }

    .mobile-image .go-button {
        font-size: 1rem;
    }
</style>
<script>
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { PUBLIC_HC_OAUTH_CLIENT_ID, PUBLIC_HC_OAUTH_REDIRECT_URL, PUBLIC_HC_OAUTH_RESPONSE_TYPE, PUBLIC_SLACK_CLIENT_ID, PUBLIC_SLACK_OAUTH_STATE, PUBLIC_SLACK_OAUTH_NONCE, PUBLIC_SLACK_REDIRECT_URI } from '$env/static/public';
    import RSVPForm from '$lib/components/RSVPForm.svelte';

    let innerHeight = $state(0);
    let innerWidth = $state(0);
    
    // Image dimensions
    const IMG_W = 3100;
    const IMG_H = 1754;
    const IMG_RATIO = IMG_W / IMG_H;

    // Calculate the dimensions of the background image as if it were "background-size: cover"
    let stageWidth = $state(IMG_W);
    let stageHeight = $state(IMG_H);

    // Update stage dimensions based on window size to mimic 'cover'
    $effect(() => {
        const winRatio = innerWidth / innerHeight;
        if (winRatio > IMG_RATIO) {
            // Window is wider than image -> Fit to Width
            stageWidth = innerWidth;
            stageHeight = innerWidth / IMG_RATIO;
        } else {
            // Window is taller than image -> Fit to Height
            stageHeight = innerHeight;
            stageWidth = innerHeight * IMG_RATIO;
        }
    });

    let tooSmall = $derived(innerWidth < 1610 || innerHeight < 765);
    let smallLayout = $derived(innerWidth > 1200 && innerWidth < 1246);
    let mobileLayout = $derived(innerWidth <= 1200);

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
        return () => window.removeEventListener('resize', updateSize);
    });
</script>

{#if mobileLayout}
<div>
    <div class="mobile-image">
        <div class="button-background"></div>
        <a href={slackRedirect} class="go-button hover:cursor-pointer">lets go</a>
        <div class="mobile-form-container">
            <RSVPForm />
        </div>
    </div>
    <div class="mobile-section"></div>
</div>
{:else}
<div class="desktop-viewport">
    <!-- The Stage: Scaled to mimic 'cover', centered. Content anchored here moves with the image. -->
    <div class="stage" style="width: {stageWidth}px; height: {stageHeight}px;">
        <!-- Background Layers -->
        <img src="/bg.png" alt="" class="stage-bg" />
        <img src="/email.png" alt="" class="stage-overlay" />

        <!-- Anchored Content -->
        <div class="anchored-form">
            <RSVPForm />
        </div>

        <div class="anchored-button-wrapper">
            <div class="button-background"></div>
            <a href={slackRedirect} class="go-button hover:cursor-pointer">lets go</a>
        </div>
    </div>
</div>
{/if}

<style>
    /* DESKTOP STYLES */
    .desktop-viewport {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        position: relative;
        background: #000; /* Fill gaps if any */
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stage {
        position: relative;
        flex-shrink: 0; /* Prevent flex from squishing the stage */
    }

    .stage-bg, .stage-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: fill; /* We forced the ratio on the container, so fill is safe/correct */
        pointer-events: none;
    }
    
    .stage-overlay {
        z-index: 1;
    }

    /* Anchoring relative to the IMAGE coordinate system */
    .anchored-form {
        position: absolute;
        top: 48%; /* Adjusted for the new coordinate system - tweak as needed */
        left: 52%;
        transform: translate(-50%, -50%);
        z-index: 2;
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .anchored-button-wrapper {
        position: absolute;
        top: 72%; /* Adjusted for image coordinates */
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 3;
    }

    /* Reuse existing button styles */
    .button-background {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 1);
        padding: 10rem;
        border-radius: 8px;
        z-index: -1;
    }

    .go-button {
        white-space: nowrap;
        padding: 1rem 2rem;
        font-size: 1.5rem;
        cursor: pointer;
        color: white;
        text-decoration: none;
        display: inline-block;
    }


    /* MOBILE STYLES (Unchanged mostly) */
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

    /* Mobile overrides for button wrapper which is not inside .stage */
    .mobile-image .button-background {
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 1);
        padding: 10rem;
        border-radius: 8px;
        z-index: 0;
    }
    
    .mobile-image .go-button {
        font-size: 1rem;
        position: absolute;
        top: 70%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }

    .mobile-form-container {
        position: absolute;
        top: 85%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        z-index: 2;
        display: flex;
        justify-content: center;
    }
</style>

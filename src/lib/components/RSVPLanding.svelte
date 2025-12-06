<script>
    import { page } from '$app/stores';
    import { PUBLIC_SLACK_CLIENT_ID, PUBLIC_SLACK_OAUTH_STATE, PUBLIC_SLACK_OAUTH_NONCE, PUBLIC_SLACK_REDIRECT_URI } from '$env/static/public';
    import EmailSignup from '$lib/components/EmailSignup.svelte';
    
    let platformEnabled = $derived($page.data.flags?.enablePlatform);

    let slackRedirect = `https://slack.com/openid/connect/authorize?response_type=code&scope=openid%20profile%20email&client_id=${PUBLIC_SLACK_CLIENT_ID}&state=${PUBLIC_SLACK_OAUTH_STATE}&nonce=${PUBLIC_SLACK_OAUTH_NONCE}&redirect_uri=${PUBLIC_SLACK_REDIRECT_URI}`
</script>

<div class="landing-container">
    <!-- Fixed top-right sign up button like Blueprint -->
    <div class="fixed-signup">
        <a href={slackRedirect} class="signup-btn">Sign up / Log in</a>
    </div>

    <div class="hero-section">
        <img src="/wallpaper.png" alt="" class="hero-bg" />
        
        <!-- Bottom left email signup -->
<!--        <div class="hero-text">-->
<!--            <h1 class="hero-title"> BuildBoard</h1>-->
<!--            <p class="hero-subtitle">This is a placeholder </p>-->
<!--        </div>-->
        <div class="signup-wrapper">
            <EmailSignup 
                headerText="Get started with BuildBoard!"
                placeholder="your@email.com"
                buttonText="Get started"
            />
            {#if platformEnabled}
                <a href="/app" class="app-button">Enter App</a>
            {/if}
        </div>
    </div>

<!--    <section class="middle-section">-->
<!--    </section>-->

<!--    <footer class="footer-section">-->
<!--        <img src="/footer.png" alt="" class="footer-bg" />-->
<!--        <div class="footer-content">-->
<!--            &lt;!&ndash; FAQ Section &ndash;&gt;-->
<!--            <div class="faq-section">-->
<!--                <h2 class="faq-title">FAQ</h2>-->
<!--                <div class="faq-grid">-->
<!--                    <div class="faq-item">-->
<!--                        <h3 class="faq-question">What is Buildboard?</h3>-->
<!--                        <p class="faq-answer">Buildboard is a program that immortalizes Hack Clubbers' projects. Ship your passion project, document the journey, and get featured on a billboard.</p>-->
<!--                    </div>-->
<!--                    <div class="faq-item">-->
<!--                        <h3 class="faq-question">Who can participate?</h3>-->
<!--                        <p class="faq-answer">Any teenager who is part of the Hack Club community can submit their projects to be featured on Buildboard.</p>-->
<!--                    </div>-->
<!--                    <div class="faq-item">-->
<!--                        <h3 class="faq-question">How do I submit my project?</h3>-->
<!--                        <p class="faq-answer">Sign up with your Hack Club Slack account, complete your profile, and submit your project through our platform.</p>-->
<!--                    </div>-->
<!--                    <div class="faq-item">-->
<!--                        <h3 class="faq-question">Where will the billboards be?</h3>-->
<!--                        <p class="faq-answer">We're planning billboards in NYC and other major cities. Stay tuned for announcements!</p>-->
<!--                    </div>-->
<!--                    <div class="faq-item">-->
<!--                        <h3 class="faq-question">Is there a deadline?</h3>-->
<!--                        <p class="faq-answer">Projects are reviewed on a rolling basis. The sooner you submit, the better your chances of being featured.</p>-->
<!--                    </div>-->
<!--                    <div class="faq-item">-->
<!--                        <h3 class="faq-question">What kind of projects qualify?</h3>-->
<!--                        <p class="faq-answer">Any creative technical project — hardware, software, games, websites, apps, and more. Show us what you've built!</p>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->

<!--        &lt;!&ndash; Footer Bottom &ndash;&gt;-->
<!--        <div class="footer-bottom">-->
<!--            <div class="footer-bottom-inner">-->
<!--                <div class="footer-left">-->
<!--                    <p class="footer-attribution">-->
<!--                        A project by <a href="https://hackclub.com?utm_source=buildboard" target="_blank" rel="noopener noreferrer">Hack Club</a>-->
<!--                    </p>-->
<!--                    <p class="footer-description">-->
<!--                        Hack Club is a 501(c)(3) nonprofit and network of 60k+ technical high schoolers.-->
<!--                    </p>-->
<!--                </div>-->
<!--                <div class="footer-links">-->
<!--                    <div class="footer-col">-->
<!--                        <p class="footer-col-title">Hack Club</p>-->
<!--                        <a href="https://hackclub.com/philosophy/" target="_blank">Philosophy</a>-->
<!--                        <a href="https://hackclub.com/team/" target="_blank">Our Team & Board</a>-->
<!--                        <a href="https://hackclub.com/brand/" target="_blank">Branding</a>-->
<!--                        <a href="https://hackclub.com/philanthropy/" target="_blank">Donate</a>-->
<!--                    </div>-->
<!--                    <div class="footer-col">-->
<!--                        <p class="footer-col-title">Resources</p>-->
<!--                        <a href="https://events.hackclub.com/" target="_blank">Community Events</a>-->
<!--                        <a href="https://jams.hackclub.com/" target="_blank">Jams</a>-->
<!--                        <a href="https://workshops.hackclub.com/" target="_blank">Workshops</a>-->
<!--                        <a href="https://hackclub.com/conduct/" target="_blank">Code of Conduct</a>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </footer>-->
</div>

<style>
    .landing-container {
        width: 100vw;
        min-height: 100vh;
        position: relative;
        background: var(--bb-bg-dark);
    }

    .fixed-signup {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 100;
    }

    @media (min-width: 768px) {
        .fixed-signup {
            top: 2rem;
            right: 2rem;
        }
    }

    .signup-btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        background-color: var(--bb-accent);
        border: 2px solid var(--bb-text-primary);
        text-decoration: none;
        transition: all 0.2s ease;
    }

    @media (min-width: 768px) {
        .signup-btn {
            padding: 0.5rem 1.5rem;
            font-size: 1.25rem;
        }
    }

    .signup-btn:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .hero-section {
        position: relative;
        width: 100%;
        min-height: 100vh;
    }

    .hero-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
    }

    .hero-text {
        position: absolute;
        bottom: 22rem;
        left: 7rem;
        z-index: 10;
    }

    .hero-title {
        font-family: 'brisbane', sans-serif;
        font-size: 5rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        margin: 0;
        letter-spacing: -0.02em;
        font-kerning: normal;
    }

    .hero-subtitle {
        font-family: 'brisbane', sans-serif;
        font-size: 1.5rem;
        color: var(--bb-text-secondary);
        margin: 0.5rem 0 0;
    }

    .hero-symbol,
    .hero-arrow {
        font-family: 'brisbane', sans-serif;
        display: inline-block;
    }

    .hero-symbol {
        margin-right: 0.25rem;
        font-size: 0.8em;
    }

    .hero-arrow {
        margin-left: 0.5rem;
    }

    @media (max-width: 640px) {
        .hero-text {
            bottom: 14rem;
            left: 1rem;
        }

        .hero-title {
            font-size: 3rem;
        }

        .hero-subtitle {
            font-size: 1rem;
        }
    }

    .signup-wrapper {
        position: absolute;
        bottom: 10rem;
        left: 7rem;
        z-index: 10;
        width: 100%;
        max-width: 28rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    @media (max-width: 640px) {
        .signup-wrapper {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            max-width: none;
        }
    }

    .app-button {
        padding: 0.75rem 2rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        background-color: transparent;
        border: 2px solid var(--bb-text-primary);
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .app-button:hover {
        background-color: rgba(255, 254, 244, 0.1);
        transform: translateY(-2px);
    }

    @media (max-width: 640px) {
        .app-button {
            font-size: 1rem;
            padding: 0.5rem 1.5rem;
        }
    }

    /* Middle Section Styles */
    .middle-section {
        width: 100%;
        min-height: 100vh;
        background: url('/middleSection.svg') no-repeat center center;
        background-size: cover;
    }

    /* Footer Styles */
    .footer-section {
        position: relative;
        width: 100%;
        padding: 20rem 2rem 4rem;
        min-height: 100vh;
        background: #a63c2a;
    }

    .faq-section {
        margin-bottom: 4rem;
    }

    .faq-title {
        font-size: 2.5rem;
        text-align: center;
        margin-bottom: 2rem;
    }

    .faq-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        max-width: 72rem;
        margin: 0 auto;
    }

    .faq-item {
        text-align: center;
    }

    .faq-question {
        font-size: 1.125rem;
        font-weight: 700;
        color: #f59e0b;
        margin-bottom: 0.5rem;
    }

    .faq-answer {
        font-size: 0.9375rem;
        color: rgba(255, 255, 255, 0.9);
        line-height: 1.5;
    }

    .footer-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2rem;
        background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.5) 100%);
        z-index: 20;
    }

    .footer-bottom-inner {
        max-width: 72rem;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
    }

    .footer-left {
        flex-shrink: 0;
    }

    .footer-bg {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: bottom;
        pointer-events: none;
        mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,1) 40%);
        -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 20%, rgba(0,0,0,1) 40%);
    }

    .footer-content {
        position: relative;
        z-index: 10;
        max-width: 72rem;
        margin: 0 auto;
        padding-bottom: 16rem;
    }

    .footer-attribution {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .footer-attribution a {
        color: #f59e0b;
        text-decoration: underline;
        transition: color 0.2s;
    }

    .footer-attribution a:hover {
        color: white;
    }

    .footer-description {
        color: rgba(255, 255, 255, 0.75);
        font-size: 0.875rem;
        max-width: 48rem;
        margin-bottom: 2rem;
    }

    .footer-links {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .footer-col {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .footer-col-title {
        font-size: 1rem;
        font-weight: 600;
        margin-right: 0.5rem;
    }

    .footer-col a {
        color: white;
        font-size: 0.875rem;
        text-decoration: none;
        transition: color 0.2s;
    }

    .footer-col a::before {
        content: "•";
        margin-right: 0.5rem;
        opacity: 0.5;
    }

    .footer-col a:hover {
        color: #f59e0b;
    }

    @media (max-width: 640px) {
        .footer-section {
            padding: 8rem 1rem 2rem;
        }

        .faq-title {
            font-size: 1.75rem;
        }

        .faq-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            text-align: left;
        }

        .faq-item {
            text-align: left;
        }

        .footer-links {
            gap: 1rem;
        }

        .footer-bottom-inner {
            flex-direction: column;
        }
    }

    @media (min-width: 641px) and (max-width: 1024px) {
        .faq-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>

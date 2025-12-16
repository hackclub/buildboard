<script>
    import EmailSignup from '$lib/components/EmailSignup.svelte';
</script>

<div class="landing-container">
    <!-- Fixed top-right sign up button -->
    <div class="fixed-signup">
        <a href="/auth/idv/start" class="signup-btn">Sign up / Log in</a>
    </div>

    <div class="hero-section">
        <img src="/buildboard-background.png" alt="" class="hero-bg" />
        
        <div class="signup-wrapper">
            <EmailSignup 
                headerText="Get started with BuildBoard!"
                placeholder="your@email.com"
                buttonText="Get started"
            />
            <a href="/home" class="app-button">Enter App</a>
        </div>
    </div>

<!--    <section class="middle-section"> -->
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

    @media (max-width: 640px) {
        .hero-bg {
            object-position: 70% center;
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
            left: 50%;
            right: auto;
            transform: translateX(-50%);
            width: calc(100% - 2rem);
            max-width: 24rem;
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
            width: 100%;
            text-align: center;
        }
    }
</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { getUser, updateUser } from "$lib/state/user.svelte";

    interface Slide {
        image: string;
        title?: string;
        subtitle?: string;
    }

    const slides: Slide[] = [
        {
            image: "/IMG_3373.png",
            title: "Welcome to BuildBoard",
            subtitle: "Click anywhere to continue"
        },
        // Add more slides here as needed
        {
            image: "/IMG_3378.jpg",
            title: "Track Your Projects",
            subtitle: "Log your coding hours and showcase your work"
        },
        {
            image: "/IMG_3373.png",
            title: "Get Started",
            subtitle: "Let's build something amazing together"
        }
    ];

    let currentSlide = $state(0);
    let isTransitioning = $state(false);

    function nextSlide() {
        if (isTransitioning) return;
        
        if (currentSlide >= slides.length - 1) {
            completeOnboarding();
            return;
        }

        isTransitioning = true;
        currentSlide++;
        
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }

    function previousSlide() {
        if (isTransitioning || currentSlide === 0) return;
        
        isTransitioning = true;
        currentSlide--;
        
        setTimeout(() => {
            isTransitioning = false;
        }, 300);
    }

    function completeOnboarding() {
        const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
        document.cookie = `onboardingComplete=true; path=/; max-age=${THIRTY_DAYS_IN_SECONDS}`;
        goto("/app/projects");
    }

    function skipOnboarding() {
        const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
        document.cookie = `onboardingSkipped=true; path=/; max-age=${THIRTY_DAYS_IN_SECONDS}`;
        goto("/app/projects");
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "ArrowRight" || event.key === " " || event.key === "Enter") {
            event.preventDefault();
            nextSlide();
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            previousSlide();
        } else if (event.key === "Escape") {
            skipOnboarding();
        }
    }

    onMount(async () => {
        if (browser) {
            const user = await updateUser();
            if (!user) {
                goto("/");
            }
        }
    });
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="onboarding" onclick={nextSlide} role="button" tabindex="0">
    {#each slides as slide, index}
        <div 
            class="slide"
            class:active={index === currentSlide}
            class:prev={index < currentSlide}
            class:next={index > currentSlide}
        >
            <img src={slide.image} alt="" class="slide-image" />
            <div class="slide-overlay"></div>
            <div class="slide-content">
                {#if slide.title}
                    <h1 class="slide-title">{slide.title}</h1>
                {/if}
                {#if slide.subtitle}
                    <p class="slide-subtitle">{slide.subtitle}</p>
                {/if}
            </div>
        </div>
    {/each}

    <!-- Progress indicators -->
    <div class="progress-bar">
        {#each slides as _, index}
            <button
                class="progress-dot"
                class:active={index === currentSlide}
                class:completed={index < currentSlide}
                onclick={(e) => {
                    e.stopPropagation();
                    currentSlide = index;
                }}
                aria-label={`Go to slide ${index + 1}`}
            ></button>
        {/each}
    </div>

    <!-- Skip button -->
    <button class="skip-button" onclick={(e) => { e.stopPropagation(); skipOnboarding(); }}>
        Skip &rarr;
    </button>

    <!-- Navigation hint -->
    <div class="nav-hint">
        <span>Click or press Space to continue</span>
    </div>
</div>

<style>
    .onboarding {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: #000;
        cursor: pointer;
        overflow: hidden;
    }

    .slide {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.4s ease, transform 0.4s ease;
        pointer-events: none;
    }

    .slide.active {
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
    }

    .slide.prev {
        opacity: 0;
        transform: translateX(-100%);
    }

    .slide.next {
        opacity: 0;
        transform: translateX(100%);
    }

    .slide-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .slide-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.2) 0%,
            rgba(0, 0, 0, 0.1) 40%,
            rgba(0, 0, 0, 0.4) 80%,
            rgba(0, 0, 0, 0.7) 100%
        );
    }

    .slide-content {
        position: absolute;
        top: 15%;
        left: 40%;
        right: 25%;
        text-align: left;
        z-index: 10;
    }

    .slide-title {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        font-weight: bold;
        color: white;
        margin: 0 0 4px 0;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }

    .slide-subtitle {
        font-size: clamp(0.875rem, 2vw, 1rem);
        color: rgba(255, 255, 255, 0.8);
        margin: 0;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
    }

    .progress-bar {
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 12px;
        z-index: 20;
    }

    .progress-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.6);
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 0;
    }

    .progress-dot:hover {
        background: rgba(255, 255, 255, 0.6);
        transform: scale(1.2);
    }

    .progress-dot.active {
        background: white;
        border-color: white;
        transform: scale(1.2);
    }

    .progress-dot.completed {
        background: rgba(255, 255, 255, 0.8);
        border-color: white;
    }

    .skip-button {
        position: absolute;
        top: 24px;
        right: 24px;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 20;
    }

    .skip-button:hover {
        background: rgba(0, 0, 0, 0.5);
        border-color: rgba(255, 255, 255, 0.4);
    }

    .nav-hint {
        position: absolute;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.875rem;
        z-index: 20;
    }

    @media (max-width: 640px) {
        .slide-content {
            top: 20%;
            left: 10%;
            right: 10%;
        }

        .progress-bar {
            bottom: 80px;
        }

        .skip-button {
            top: 16px;
            right: 16px;
            padding: 8px 16px;
            font-size: 0.875rem;
        }
    }
</style>

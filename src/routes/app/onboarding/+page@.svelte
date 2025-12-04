<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { getUser, updateUser } from "$lib/state/user.svelte";

    const dialogues = [
        "Welcome to BuildBoard.",
        "How many teenagers can say their project was on a billboard in Times Square?",
        "With BuildBoard, you commit to one project — and we watch it rise to the top of Hacker News, YouTube, and the NYC Billboard.",
        "Your project will progress through four milestones:",
        "Magic Happening → Hacker News → YouTube Short → NYC Billboard.",
        "Ready to build something worth putting on a billboard?"
    ];

    let step = $state(0);
    let displayedText = $state("");
    let isTyping = $state(false);
    let typewriterTimeout: ReturnType<typeof setTimeout>;

    function typeText(text: string) {
        isTyping = true;
        displayedText = "";
        let i = 0;
        
        function typeNextChar() {
            if (i < text.length) {
                displayedText += text[i];
                i++;
                typewriterTimeout = setTimeout(typeNextChar, 30);
            } else {
                isTyping = false;
            }
        }
        
        typeNextChar();
    }

    function nextStep() {
        if (isTyping) {
            clearTimeout(typewriterTimeout);
            displayedText = dialogues[step];
            isTyping = false;
            return;
        }

        step++;

        if (step >= dialogues.length) {
            completeOnboarding();
            return;
        }

        typeText(dialogues[step]);
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
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            nextStep();
        } else if (event.key === "Escape") {
            skipOnboarding();
        }
    }

    onMount(async () => {
        if (browser) {
            const user = await updateUser();
            if (!user) {
                goto("/");
                return;
            }
            typeText(dialogues[0]);
        }
    });
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="onboarding" onclick={nextStep} role="button" tabindex="0">
    <!-- Background -->
    <img src="/IMG_3373.png" alt="" class="background-image" />
    <div class="background-overlay"></div>

    <!-- Dialogue box at bottom like Midnight -->
    <div class="dialogue-box">
        <div class="dialogue-label">
            <span class="dialogue-speaker">BUILDBOARD</span>
        </div>
        <div class="dialogue-content">
            <p class="dialogue-text">{displayedText}<span class="cursor" class:typing={isTyping}>|</span></p>
            <p class="dialogue-hint">{isTyping ? "Click to skip" : "Click to continue"}</p>
        </div>
    </div>

    <!-- Skip button -->
    <button class="skip-button" onclick={(e) => { e.stopPropagation(); skipOnboarding(); }}>
        Skip →
    </button>
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

    .background-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .background-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.2) 60%,
            rgba(0, 0, 0, 0.7) 100%
        );
    }

    /* Dialogue box - Midnight style at bottom */
    .dialogue-box {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #1c1c1c;
        padding: 32px 50px;
        min-height: 160px;
        z-index: 100;
    }

    .dialogue-label {
        position: absolute;
        top: -24px;
        left: 50px;
        background: #e94560;
        padding: 8px 20px;
        border-radius: 6px 6px 0 0;
    }

    .dialogue-speaker {
        font-size: 0.875rem;
        font-weight: 700;
        color: white;
        letter-spacing: 2px;
        text-transform: uppercase;
    }

    .dialogue-content {
        max-width: 900px;
    }

    .dialogue-text {
        font-size: 1.75rem;
        color: white;
        margin: 0;
        line-height: 1.5;
        font-family: inherit;
    }

    .cursor {
        opacity: 1;
        animation: blink 0.7s infinite;
    }

    .cursor.typing {
        animation: none;
        opacity: 1;
    }

    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }

    .dialogue-hint {
        font-size: 0.875rem;
        color: #666;
        margin: 16px 0 0 0;
        text-align: right;
    }

    /* Skip button */
    .skip-button {
        position: fixed;
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
        z-index: 200;
    }

    .skip-button:hover {
        background: rgba(0, 0, 0, 0.5);
        border-color: rgba(255, 255, 255, 0.4);
    }

    @media (max-width: 640px) {
        .dialogue-box {
            padding: 24px 24px;
            min-height: 140px;
        }

        .dialogue-label {
            left: 24px;
            top: -20px;
            padding: 6px 14px;
        }

        .dialogue-speaker {
            font-size: 0.75rem;
        }

        .dialogue-text {
            font-size: 1.25rem;
        }

        .skip-button {
            top: 16px;
            right: 16px;
            padding: 8px 16px;
            font-size: 0.875rem;
        }
    }
</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { getUser, updateUser } from "$lib/state/user.svelte";
    import { page } from "$app/stores";

    interface Author {
        id: string;
        name: string;
        avatar: string;
    }

    const AUTHORS: Author[] = [
        { id: 'dhamari', name: 'Dhamari', avatar: '/slides/dhamari.png' },
        { id: 'alex', name: 'Alex', avatar: '/slides/alex.png' }
    ];

    const slides = [
        {
            image: "/slides/slide_one.png",
            text: "Welcome..... sooo you wanna be known for building cool shit?",
            showCharacterSelect: false,
            showTerms: false
        },
        {
            image: "/slides/slide_one.png",
            text: "Good for you, your guide is here to help you.",
            showCharacterSelect: true,
            showTerms: false
        },
        {
            image: "/slides/slide_two.jpg",
            text: "Here's how it works: Link your GitHub repo and Hackatime to start tracking your progress.",
            showCharacterSelect: false,
            showTerms: false
        },
        {
            image: "/slides/slide_two.jpg",
            text: "Ship your project, get it approved, and log 30+ hours to reach Billboard status.",
            showCharacterSelect: false,
            showTerms: false
        },
        {
            image: "/slides/slide_two.jpg",
            text: "Before we begin, please read and agree to our terms.",
            showCharacterSelect: false,
            showTerms: true
        }
    ];

    let step = $state(0);
    let displayedText = $state("");
    let isTyping = $state(false);
    let showCharacterOptions = $state(false);
    let typewriterTimeout: ReturnType<typeof setTimeout>;
    let selectedAuthor = $state<Author | null>(null);
    let hasScrolledToBottom = $state(false);
    let showTermsBox = $state(false);
    let hasAgreedToTerms = $state(false);

    function typeText(text: string) {
        isTyping = true;
        displayedText = "";
        showCharacterOptions = false;
        let i = 0;

        function typeNextChar() {
            if (i < text.length) {
                const char = text[i];

                if (displayedText === "Welcome" && text[i] === ".") {
                    let dotCount = 0;
                    while (text[i + dotCount] === ".") dotCount++;

                    let dotIndex = 0;
                    function typeDot() {
                        if (dotIndex < dotCount) {
                            displayedText += ".";
                            dotIndex++;
                            i++;
                            const delay = 200 + (dotIndex * 80);
                            typewriterTimeout = setTimeout(typeDot, delay);
                        } else {
                            typewriterTimeout = setTimeout(() => {
                                displayedText += " ";
                                typeNextChar();
                            }, 400);
                        }
                    }
                    typeDot();
                    return;
                }

                displayedText += char;
                i++;
                typewriterTimeout = setTimeout(typeNextChar, 30);
            } else {
                isTyping = false;
                if (slides[step].showCharacterSelect) {
                    setTimeout(() => {
                        showCharacterOptions = true;
                    }, 600);
                }
                if (slides[step].showTerms) {
                    setTimeout(() => {
                        showTermsBox = true;
                    }, 600);
                }
            }
        }

        typeNextChar();
    }

    function handleTermsScroll(e: Event) {
        const target = e.target as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = target;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            hasScrolledToBottom = true;
        }
    }

    function agreeToTerms() {
        if (hasAgreedToTerms) {
            completeOnboarding();
        }
    }

    function selectAuthor(author: Author) {
        selectedAuthor = author;
        nextStep();
    }

    function nextStep() {
        if (isTyping) {
            clearTimeout(typewriterTimeout);
            displayedText = slides[step].text;
            isTyping = false;
            if (slides[step].showCharacterSelect) {
                showCharacterOptions = true;
            }
            if (slides[step].showTerms) {
                showTermsBox = true;
            }
            return;
        }

        if (slides[step].showCharacterSelect && !selectedAuthor) {
            return;
        }

        if (slides[step].showTerms) {
            return;
        }

        step++;

        if (step >= slides.length) {
            completeOnboarding();
            return;
        }

        showTermsBox = false;
        hasScrolledToBottom = false;
        typeText(slides[step].text);
    }

    async function completeOnboarding() {
        // Use server-side data first, fall back to client state
        let user = $page.data.user || getUser();
        
        // If user still isn't loaded, try to fetch them
        if (!user) {
            user = await updateUser();
        }
        
        if (user) {
            const response = await fetch(`/api/users/${user.user_id}/onboarding-complete`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                console.error('Failed to complete onboarding:', await response.text());
            }
            
            // Wait for user state to update before navigating
            await updateUser();
        }
        
        goto("/home");
    }

    function skipToTerms() {
        clearTimeout(typewriterTimeout);
        const termsSlideIndex = slides.findIndex(s => s.showTerms);
        if (termsSlideIndex !== -1) {
            step = termsSlideIndex;
            typeText(slides[termsSlideIndex].text);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            if (!slides[step].showCharacterSelect || selectedAuthor) {
                nextStep();
            }
        } else if (event.key === "Escape") {
            skipToTerms();
        }
    }

    function handleMainClick() {
        if (!slides[step].showCharacterSelect || selectedAuthor) {
            nextStep();
        }
    }

    onMount(async () => {
        if (browser) {
            // Server already validated auth and redirects if needed
            // Just start the typewriter effect
            typeText(slides[0].text);
        }
    });

    let speakerName = $derived(selectedAuthor ? selectedAuthor.name.toUpperCase() : "BUILDBOARD");
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="onboarding" onclick={handleMainClick} role="button" tabindex="0">
    <!-- Background - changes with each slide -->
    {#each slides as slide, index}
        <img
            src={slide.image}
            alt=""
            class="background-image"
            class:active={index === step}
        />
    {/each}
    <div class="background-overlay"></div>

    <!-- Character Selection - shows after typing finishes -->
    {#if showCharacterOptions && !selectedAuthor}
        <div class="character-select">
            <p class="select-prompt">Choose your guide</p>
            <div class="characters">
                {#each AUTHORS as author}
                    <button class="character-option" onclick={(e) => { e.stopPropagation(); selectAuthor(author); }}>
                        <img src={author.avatar} alt={author.name} class="character-image" />
                        <span class="character-name">{author.name.toUpperCase()}</span>
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Selected character display - shows after selection -->
    {#if selectedAuthor && !slides[step].showTerms}
        <div class="selected-character">
            <img src={selectedAuthor.avatar} alt={selectedAuthor.name} class="guide-image" />
        </div>
    {/if}

    <!-- Terms and Conditions - shows on terms slide -->
    {#if showTermsBox}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="terms-container" onclick={(e) => e.stopPropagation()}>
            <h3 class="terms-title">Terms & Conditions</h3>
            <div class="terms-box" onscroll={handleTermsScroll}>
                <p><strong>BuildBoard Participation Agreement</strong></p>

                <p>By participating in BuildBoard, you acknowledge and agree to the following terms:</p>

                <p><strong>1. Eligibility</strong><br/>
                BuildBoard is open to teenagers 18 years old and under. By continuing, you confirm you meet this age requirement.</p>

                <p><strong>2. Project Commitment</strong><br/>
                You agree to commit to building and completing your project through the milestone stages. While life happens, we encourage genuine effort and progress.</p>

                <p><strong>3. Content Guidelines</strong><br/>
                All projects and content shared must be appropriate, original, and not violate any copyrights or intellectual property rights. No NSFW, hateful, or harmful content.</p>

                <p><strong>4. Community Standards</strong><br/>
                You agree to treat other participants with respect and maintain a positive, supportive community environment.</p>

                <p><strong>5. Data & Privacy</strong><br/>
                Your project information and progress may be displayed publicly on BuildBoard. We will not sell your personal data to third parties. By agreeing, you consent to receive updates, tips, and announcements about BuildBoard via email.</p>

                <p><strong>6. Promotion Rights</strong><br/>
                By participating, you grant BuildBoard permission to feature your project on our platforms, including Magic Happening, social media, and promotional materials.</p>

                <p><strong>TL;DR:</strong> Be kind, build cool stuff, keep it appropriate, and let us celebrate your work!</p>
            </div>
            <label class="terms-read-checkbox" class:disabled={!hasScrolledToBottom}>
                <input
                    type="checkbox"
                    bind:checked={hasAgreedToTerms}
                    disabled={!hasScrolledToBottom}
                    class="terms-checkbox"
                />
                <span class="terms-checkbox-label">
                    {#if hasScrolledToBottom}
                        I have read and agree to the terms and conditions
                    {:else}
                        Scroll to read all terms first
                    {/if}
                </span>
            </label>
            <button
                class="terms-agree-button"
                class:enabled={hasAgreedToTerms}
                onclick={agreeToTerms}
                disabled={!hasAgreedToTerms}
            >
                {hasAgreedToTerms ? "Let's Build!" : "Agree to terms above to continue"}
            </button>
        </div>
    {/if}

    <!-- Dialogue box at bottom like Midnight -->
    <div class="dialogue-box">
        <div class="dialogue-label">
            <span class="dialogue-speaker">{speakerName}</span>
        </div>
        <div class="dialogue-content">
            <p class="dialogue-text">
                {displayedText}<span class="cursor" class:typing={isTyping}>|</span>
            </p>
            {#if showCharacterOptions && !selectedAuthor}
                <p class="dialogue-hint">Choose a guide above</p>
            {:else if showTermsBox}
                <p class="dialogue-hint">Read and agree to the terms above</p>
            {:else}
                <p class="dialogue-hint">{isTyping ? "Click to skip" : "Click to continue"}</p>
            {/if}
        </div>
    </div>

    <!-- Skip button - hidden on terms slide -->
    {#if !slides[step].showTerms}
        <button class="skip-button" onclick={(e) => { e.stopPropagation(); skipToTerms(); }}>
            Skip →
        </button>
    {/if}

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
        opacity: 0;
        transition: opacity 0.5s ease;
    }

    .background-image.active {
        opacity: 1;
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

    /* Character Selection - Right corner like Midnight */
    .character-select {
        position: fixed;
        bottom: 160px;
        right: 60px;
        z-index: 50;
        text-align: center;
    }

    .select-prompt {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.6);
        margin: 0 0 12px 0;
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .characters {
        display: flex;
        gap: 32px;
        align-items: flex-end;
    }

    .character-option {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .character-option:hover {
        transform: translateY(-12px);
        filter: brightness(1.2);
    }

    .character-image {
        width: 200px;
        height: 350px;
        object-fit: contain;
    }

    .character-name {
        display: block;
        margin-top: 8px;
        font-size: 1rem;
        font-weight: 700;
        color: white;
        letter-spacing: 1px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .character-option:hover .character-name {
        opacity: 1;
    }

    /* Selected character - prominent display */
    .selected-character {
        position: fixed;
        bottom: 160px;
        right: 60px;
        z-index: 50;
        animation: characterEnter 0.5s ease-out;
    }

    .guide-image {
        width: 280px;
        height: 450px;
        object-fit: contain;
        filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.4));
    }

    @keyframes characterEnter {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
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
        border-radius: 0;
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
        border-radius: 0;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 200;
    }

    .skip-button:hover {
        background: rgba(0, 0, 0, 0.5);
        border-color: rgba(255, 255, 255, 0.4);
    }

    /* Terms and Conditions */
    .terms-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 150;
        background: rgba(28, 28, 28, 0.95);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 0;
        padding: 24px;
        max-width: 600px;
        width: calc(100% - 48px);
        animation: termsEnter 0.4s ease-out;
    }

    @keyframes termsEnter {
        from {
            opacity: 0;
            transform: translate(-50%, -45%);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%);
        }
    }

    .terms-title {
        color: white;
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0 0 16px 0;
        text-align: center;
        letter-spacing: 1px;
    }

    .terms-box {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0;
        padding: 20px;
        max-height: 250px;
        overflow-y: auto;
        margin-bottom: 16px;
        font-size: 0.9rem;
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.85);
    }

    .terms-box p {
        margin: 0 0 12px 0;
    }

    .terms-box p:last-child {
        margin-bottom: 0;
    }

    .terms-box strong {
        color: white;
    }

    .terms-read-checkbox {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
        cursor: pointer;
        padding: 14px;
        background: rgba(233, 69, 96, 0.1);
        border: 2px solid rgba(233, 69, 96, 0.3);
        border-radius: 0;
        transition: all 0.2s ease;
    }

    .terms-read-checkbox:not(.disabled):hover {
        background: rgba(233, 69, 96, 0.15);
        border-color: rgba(233, 69, 96, 0.5);
    }

    .terms-read-checkbox.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .terms-checkbox {
        width: 20px;
        height: 20px;
        accent-color: #e94560;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 2px;
    }

    .terms-checkbox:disabled {
        cursor: not-allowed;
    }

    .terms-checkbox-label {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.4;
    }

    .terms-read-checkbox.disabled .terms-checkbox-label {
        color: rgba(255, 255, 255, 0.5);
    }

    .terms-agree-button {
        width: 100%;
        padding: 16px 24px;
        border: 2px solid #343a40;
        border-radius: 0;
        font-size: 1rem;
        font-weight: 700;
        cursor: not-allowed;
        transition: all 0.2s ease;
        background: #555;
        color: rgba(255, 255, 255, 0.5);
    }

    .terms-agree-button.enabled {
        background: #e94560;
        border-color: #e94560;
        color: white;
        cursor: pointer;
    }

    .terms-agree-button.enabled:hover {
        background: #d63850;
        border-color: #d63850;
    }

    @media (max-width: 640px) {
        .character-select {
            bottom: 150px;
            right: 16px;
        }

        .characters {
            gap: 16px;
        }

        .character-image {
            width: 120px;
            height: 220px;
        }

        .selected-character {
            bottom: 150px;
            right: 16px;
        }

        .guide-image {
            width: 180px;
            height: 300px;
        }

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

        .terms-container {
            padding: 16px;
            width: calc(100% - 32px);
        }

        .terms-box {
            max-height: 180px;
            padding: 16px;
            font-size: 0.85rem;
        }

        .terms-agree-button {
            padding: 14px 20px;
            font-size: 0.9rem;
        }
    }
</style>

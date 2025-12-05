<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { getUser, updateUser } from "$lib/state/user.svelte";

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
            showCharacterSelect: false
        },
        {
            image: "/slides/slide_one.png",
            text: "Good for you, your guide is here to help you.",
            showCharacterSelect: true
        },
        {
            image: "/slides/slide_two.jpg",
            text: "BuildBoard is your chance. Commit to one project and watch it go through a series of milestones.",
            showCharacterSelect: false
        },
        {
            image: "/slides/slide_two.jpg",
            text: "See your project on Magic Happening → Hacker News → YouTube Short → NYC Billboard.",
            showCharacterSelect: false
        }
    ];

    let step = $state(0);
    let displayedText = $state("");
    let isTyping = $state(false);
    let showCharacterOptions = $state(false);
    let typewriterTimeout: ReturnType<typeof setTimeout>;
    let selectedAuthor = $state<Author | null>(null);

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
            }
        }
        
        typeNextChar();
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
            return;
        }

        if (slides[step].showCharacterSelect && !selectedAuthor) {
            return;
        }

        step++;

        if (step >= slides.length) {
            completeOnboarding();
            return;
        }

        typeText(slides[step].text);
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
            if (!slides[step].showCharacterSelect || selectedAuthor) {
                nextStep();
            }
        } else if (event.key === "Escape") {
            skipOnboarding();
        }
    }

    function handleMainClick() {
        if (!slides[step].showCharacterSelect || selectedAuthor) {
            nextStep();
        }
    }

    onMount(async () => {
        if (browser) {
            const user = await updateUser();
            if (!user) {
                goto("/");
                return;
            }
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
    {#if selectedAuthor}
        <div class="selected-character">
            <img src={selectedAuthor.avatar} alt={selectedAuthor.name} class="guide-image" />
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
            {:else}
                <p class="dialogue-hint">{isTyping ? "Click to skip" : "Click to continue"}</p>
            {/if}
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
    }
</style>

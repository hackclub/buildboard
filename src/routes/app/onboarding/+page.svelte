<script lang="ts">
    import { onMount } from "svelte";
    import { getUser } from "$lib/state/user.svelte";

    let { data } = $props();
    let hackatimeAcknowledged = $state(data.hackatimeAcknowledged);
    let isIDV = $state(data.isIDV);

    function acknowledgeHackatime() {
        hackatimeAcknowledged = true;
        document.cookie =
            "hackatimeAcknowledged=true; path=/; max-age=" + 30 * 24 * 60 * 60;
        checkCompletion();
    }

    function skipOnboarding() {
        document.cookie =
            "onboardingSkipped=true; path=/; max-age=" + 30 * 24 * 60 * 60;
        window.location.href = "/app/projects";
    }

    function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(";").shift();
        return null;
    }

    function checkCompletion() {
        if (hackatimeAcknowledged && isIDV) {
            window.location.href = "/app/projects";
        }
    }

    onMount(() => {
        const acknowledged = getCookie("hackatimeAcknowledged");
        if (acknowledged === "true") {
            hackatimeAcknowledged = true;
        }
        checkCompletion();
    });
</script>

<div class="fixed top-4 right-4">
    <button
        onclick={skipOnboarding}
        class="text-neutral-500 hover:text-neutral-800 font-bold text-lg px-4 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
    >
        Skip for now &rarr;
    </button>
</div>

{#if !hackatimeAcknowledged}
    <h1 class="text-center mt-40 text-6xl font-bold">
        Have you installed Hackatime?
    </h1>
    <div class="text-center">
        <button
            onclick={() =>
                (window.location.href = "https://hackatime.hackclub.com")}
            class="bg-red-700/50 px-10 py-2 text-2xl rounded-xl hover:scale-105 hover:bg-red-700/30 hover:cursor-pointer mt-10 mb-10 hover:underline"
        >
            <h2>If you haven't, install it now</h2>
        </button>
        <h2 class="text-2xl font-bold mb-10">If you have, acknowledge this:</h2>
        <p class="text-2xl font-pangolin px-20">
            Don’t cheat the time tracking system. No bots, no fake key presses,
            no UI manipulation. If you do, you’ll be banned from Hackatime and
            other participating YSWS / events / programs
        </p>
        <button
            onclick={acknowledgeHackatime}
            class="bg-green-700/50 px-10 py-2 text-2xl rounded-xl hover:scale-105 hover:bg-green-700/30 hover:cursor-pointer mt-10 mb-5 hover:underline"
        >
            <p>I agree</p>
        </button>
        <img src="/please.gif" alt="Pwease" class="w-48 mx-auto mt-10" />
    </div>
{:else if !isIDV}
    <h1 class="text-center mt-40 text-6xl font-bold">
        Identity Verification Required
    </h1>
    <div class="text-center">
        <p class="text-2xl font-pangolin px-20 mt-10 mb-10">
            You need to complete identity verification to use the platform.
        </p>
        <button
            onclick={() =>
                (window.location.href = "https://hca.dinosaurbbq.org")}
            class="bg-blue-700/50 px-10 py-2 text-2xl rounded-xl hover:scale-105 hover:bg-blue-700/30 hover:cursor-pointer mb-10 hover:underline"
        >
            <h2>Complete Verification</h2>
        </button>
    </div>
{/if}

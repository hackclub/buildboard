<script lang="ts">
    import { onMount } from 'svelte';
    import { getUser } from '$lib/state/user.svelte';

    let hackatimeAcknowledged = $state(false);

    function acknowledgeHackatime() {
        hackatimeAcknowledged = true;
        document.cookie = "hackatimeAcknowledged=true; path=/; max-age=" + (30 * 24 * 60 * 60);
    }

    function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    }

    onMount(() => {
        const acknowledged = getCookie('hackatimeAcknowledged');
        if (acknowledged === 'true') {
            hackatimeAcknowledged = true;
        }
    });
</script>

{#if hackatimeAcknowledged}
    <h1>Projects</h1>
    <p>Here are your projects.</p>
    <!-- We will add the project list here next -->
{:else}
    <h1 class="text-center mt-40 text-6xl font-bold">
        Have you installed Hackatime?
    </h1>
    <div class="text-center">
        <button onclick={() => window.location.href ="https://hackatime.hackclub.com"} class="bg-red-700/50 px-10 py-2 text-2xl rounded-xl hover:scale-105 hover:bg-red-700/30 hover:cursor-pointer mt-10 mb-10 hover:underline">
            <h2>If you haven't, install it now</h2>
        </button>
        <h2 class="text-2xl font-bold mb-10">If you have, acknowledge this:</h2>
        <p class="text-2xl font-pangolin px-20">Don’t cheat the time tracking system. No bots, no fake key presses, no UI manipulation. If you do, you’ll be banned from Hackatime and other participating YSWS / events / programs</p>
        <button onclick={acknowledgeHackatime} class="bg-green-700/50 px-10 py-2 text-2xl rounded-xl hover:scale-105 hover:bg-green-700/30 hover:cursor-pointer mt-10 mb-5 hover:underline">
            <p>I agree</p>
        </button>
        <img src="/please.gif" alt="Pwease" class="w-48 mx-auto mt-10"/>
    </div>
{/if}

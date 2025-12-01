<!--<script lang="ts">-->
<!--    import type { PageData } from "./$types";-->
<!--    import { enhance } from "$app/forms";-->

<!--    let { data }: { data: PageData } = $props();-->

<!--    let handle = $state(data.user?.handle ?? "");-->
<!--    let isPublic = $state(data.user?.is_public ?? false);-->
<!--    let showHandleInput = $state(true); // Logic to determine if user has "claimed" handle would go here-->
<!--    let showPrivacyPrompt = $state(false);-->
<!--    let newHandle = $state("");-->

<!--    function saveHandle() {-->
<!--        if (newHandle.trim()) {-->
<!--            handle = newHandle.startsWith("@") ? newHandle : `@${newHandle}`;-->
<!--            newHandle = "";-->
<!--            showHandleInput = false;-->
<!--            showPrivacyPrompt = true;-->
<!--            // In a real app, you would send this to the server here-->
<!--        }-->
<!--    }-->

<!--    function togglePrivacy() {-->
<!--        // This is now handled by the form action-->
<!--    }-->

<!--    function copyToClipboard() {-->
<!--        navigator.clipboard.writeText(window.location.href).then(() => {-->
<!--            alert("Profile link copied to clipboard!");-->
<!--        });-->
<!--    }-->

<!--    // Mock badges for the card-->
<!--    const badges = [-->
<!--        { icon: "✦", label: "1.1K" },-->
<!--        { icon: "☗", label: "53" },-->
<!--        { icon: "◈", label: "1.3K" },-->
<!--        { icon: "⚔", label: "15.3K" },-->
<!--        { icon: "★", label: "" },-->
<!--        { icon: "👁", label: "" },-->
<!--        { icon: "✎", label: "" },-->
<!--        { icon: "☀", label: "" },-->
<!--        { icon: "◎", label: "" },-->
<!--        { icon: "▣", label: "" },-->
<!--        { icon: "◍", label: "" },-->
<!--        { icon: "◒", label: "" },-->
<!--        { icon: "⚘", label: "" },-->
<!--    ];-->
<!--</script>-->

<!--<div-->
<!--    class="min-h-screen bg-[#fafaf8] text-[#0b0d0b] font-sans selection:bg-black/10 p-8"-->
<!--&gt;-->
<!--    {#if data.error}-->
<!--        <div-->
<!--            class="max-w-[1200px] mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg"-->
<!--        >-->
<!--            <h3 class="font-bold">Error loading profile</h3>-->
<!--            <p>{data.error}</p>-->
<!--        </div>-->
<!--    {:else if data.user}-->
<!--        <div-->
<!--            class="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start"-->
<!--        >-->
<!--            &lt;!&ndash; LEFT COLUMN: Profile Card &ndash;&gt;-->
<!--            <div-->
<!--                class="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden relative"-->
<!--            >-->
<!--                &lt;!&ndash; Abstract Header Background &ndash;&gt;-->
<!--                <div-->
<!--                    class="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden"-->
<!--                >-->
<!--                    &lt;!&ndash; Mesh gradient simulation &ndash;&gt;-->
<!--                    <div-->
<!--                        class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100/50 to-orange-100/50 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"-->
<!--                    ></div>-->
<!--                    <div-->
<!--                        class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"-->
<!--                    ></div>-->

<!--                    &lt;!&ndash; Vertical Label: ACTIVITY &ndash;&gt;-->
<!--                    <div-->
<!--                        class="absolute top-full left-0 -translate-y-full h-[300px] w-8 flex items-end justify-center pb-4"-->
<!--                    >-->
<!--                        <span-->
<!--                            class="transform -rotate-90 text-[10px] font-bold tracking-widest text-gray-300 origin-bottom-left translate-x-full"-->
<!--                            >ACTIVITY</span-->
<!--                        >-->
<!--                    </div>-->
<!--                </div>-->

<!--                &lt;!&ndash; Card Content &ndash;&gt;-->
<!--                <div class="px-8 pb-8 relative">-->
<!--                    &lt;!&ndash; Avatar &ndash;&gt;-->
<!--                    <div-->
<!--                        class="absolute -top-16 left-8 w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm"-->
<!--                    >-->
<!--                        <img-->
<!--                            src={`https://ui-avatars.com/api/?name=${data.user.first_name}+${data.user.last_name}&background=random`}-->
<!--                            alt={`${data.user.first_name} ${data.user.last_name}`}-->
<!--                            class="w-full h-full object-cover"-->
<!--                        />-->
<!--                    </div>-->

<!--                    &lt;!&ndash; Identity &ndash;&gt;-->
<!--                    <div class="mt-20 mb-8">-->
<!--                        <h1-->
<!--                            class="text-3xl font-serif font-medium tracking-tight mb-1 text-[#0b0d0b]"-->
<!--                        >-->
<!--                            {data.user.first_name}-->
<!--                            {data.user.last_name}-->
<!--                        </h1>-->
<!--                        <p class="text-sm text-[#878b86] font-mono">{handle}</p>-->
<!--                    </div>-->

<!--                    &lt;!&ndash; Stats Section &ndash;&gt;-->
<!--                    <div-->
<!--                        class="border-t border-b border-gray-100 py-6 mb-6 relative"-->
<!--                    >-->
<!--                        &lt;!&ndash; Vertical Label: BADGES &ndash;&gt;-->
<!--                        <div-->
<!--                            class="absolute top-full left-[-32px] h-[200px] w-8 flex items-end justify-center pb-4"-->
<!--                        >-->
<!--                            <span-->
<!--                                class="transform -rotate-90 text-[10px] font-bold tracking-widest text-gray-300 origin-bottom-left translate-x-full"-->
<!--                                >BADGES</span-->
<!--                            >-->
<!--                        </div>-->

<!--                        <div class="grid grid-cols-2 gap-y-4 gap-x-8">-->
<!--                            &lt;!&ndash; Row 1 &ndash;&gt;-->
<!--                            <div class="flex items-baseline gap-2">-->
<!--                                <span class="text-lg font-bold text-[#0b0d0b]"-->
<!--                                    >1,143</span-->
<!--                                >-->
<!--                                <span-->
<!--                                    class="text-[10px] font-bold text-gray-400 tracking-wider uppercase"-->
<!--                                    >MSGS</span-->
<!--                                >-->
<!--                            </div>-->
<!--                            <div class="flex items-baseline gap-2 justify-end">-->
<!--                                <span class="text-lg font-bold text-emerald-500"-->
<!--                                    >+13,772</span-->
<!--                                >-->
<!--                                <span-->
<!--                                    class="text-[10px] font-bold text-emerald-500/70 tracking-wider uppercase"-->
<!--                                    >ADDED</span-->
<!--                                >-->
<!--                            </div>-->

<!--                            &lt;!&ndash; Row 2 &ndash;&gt;-->
<!--                            <div class="flex items-baseline gap-2">-->
<!--                                <span class="text-lg font-bold text-[#0b0d0b]"-->
<!--                                    >53</span-->
<!--                                >-->
<!--                                <span-->
<!--                                    class="text-[10px] font-bold text-gray-400 tracking-wider uppercase"-->
<!--                                    >THREADS</span-->
<!--                                >-->
<!--                            </div>-->
<!--                            <div class="flex items-baseline gap-2 justify-end">-->
<!--                                <span class="text-lg font-bold text-rose-500"-->
<!--                                    >-925</span-->
<!--                                >-->
<!--                                <span-->
<!--                                    class="text-[10px] font-bold text-rose-500/70 tracking-wider uppercase"-->
<!--                                    >REMOVED</span-->
<!--                                >-->
<!--                            </div>-->

<!--                            &lt;!&ndash; Row 3 &ndash;&gt;-->
<!--                            <div class="flex items-baseline gap-2">-->
<!--                                <span class="text-lg font-bold text-[#0b0d0b]"-->
<!--                                    >277</span-->
<!--                                >-->
<!--                                <span-->
<!--                                    class="text-[10px] font-bold text-gray-400 tracking-wider uppercase"-->
<!--                                    >XP</span-->
<!--                                >-->
<!--                            </div>-->
<!--                            <div class="flex items-baseline gap-2 justify-end">-->
<!--                                <span class="text-lg font-bold text-amber-500"-->
<!--                                    >~553</span-->
<!--                                >-->
<!--                                <span-->
<!--                                    class="text-[10px] font-bold text-amber-500/70 tracking-wider uppercase"-->
<!--                                    >CHANGED</span-->
<!--                                >-->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </div>-->

<!--                    &lt;!&ndash; Badges Grid &ndash;&gt;-->
<!--                    <div class="grid grid-cols-5 gap-3">-->
<!--                        {#each badges as badge}-->
<!--                            <div-->
<!--                                class="aspect-[2/3] rounded-full border border-gray-200 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer group relative overflow-hidden"-->
<!--                            >-->
<!--                                <span-->
<!--                                    class="text-xl text-gray-600 group-hover:text-black transition-colors"-->
<!--                                    >{badge.icon}</span-->
<!--                                >-->
<!--                                {#if badge.label}-->
<!--                                    <span-->
<!--                                        class="text-[9px] font-bold text-gray-500 mt-1 bg-white px-1.5 rounded-full border border-gray-100 shadow-sm"-->
<!--                                        >{badge.label}</span-->
<!--                                    >-->
<!--                                {/if}-->
<!--                            </div>-->
<!--                        {/each}-->
<!--                    </div>-->

<!--                    <div class="mt-8 pt-4 border-t border-gray-100">-->
<!--                        <div-->
<!--                            class="text-[10px] font-bold text-gray-400 tracking-wider uppercase"-->
<!--                        >-->
<!--                            100% JETBRAINS-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->

<!--            &lt;!&ndash; RIGHT COLUMN: Content &ndash;&gt;-->
<!--            <div class="flex flex-col gap-8">-->
<!--                &lt;!&ndash; Header Actions &ndash;&gt;-->
<!--                <div class="flex justify-between items-center">-->
<!--                    <div>-->
<!--                        <h2 class="text-xl font-bold text-[#0b0d0b]">-->
<!--                            {handle.replace("@", "")}-->
<!--                        </h2>-->
<!--                        <p class="text-sm text-gray-500">-->
<!--                            0 following · 0 followers-->
<!--                        </p>-->
<!--                    </div>-->
<!--                    <div class="flex gap-3 items-center">-->
<!--                        <button-->
<!--                            on:click={copyToClipboard}-->
<!--                            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"-->
<!--                            >Share</button-->
<!--                        >-->
<!--                        {#if data.isOwner}-->
<!--                            <button-->
<!--                                class="px-4 py-2 bg-[#0b0d0b] text-white border border-transparent rounded-lg text-sm font-medium hover:bg-black/80 transition-colors shadow-sm"-->
<!--                                >Edit Profile</button-->
<!--                            >-->
<!--                        {/if}-->
<!--                    </div>-->
<!--                </div>-->

<!--                <div class="flex justify-end">-->
<!--                    {#if data.isOwner}-->
<!--                        <form-->
<!--                            method="POST"-->
<!--                            action="?/updatePrivacy"-->
<!--                            use:enhance={() => {-->
<!--                                return async ({ result }) => {-->
<!--                                    if (result.type === "success") {-->
<!--                                        isPublic = !isPublic;-->
<!--                                    }-->
<!--                                };-->
<!--                            }}-->
<!--                        >-->
<!--                            <input-->
<!--                                type="hidden"-->
<!--                                name="isPublic"-->
<!--                                value={(!isPublic).toString()}-->
<!--                            />-->
<!--                            <button-->
<!--                                class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"-->
<!--                            >-->
<!--                                <span-->
<!--                                    class={`w-2 h-2 rounded-full ${isPublic ? "bg-emerald-500" : "bg-gray-400"}`}-->
<!--                                ></span>-->
<!--                                {isPublic ? "Public" : "Private"}-->
<!--                                <svg-->
<!--                                    xmlns="http://www.w3.org/2000/svg"-->
<!--                                    width="12"-->
<!--                                    height="12"-->
<!--                                    viewBox="0 0 24 24"-->
<!--                                    fill="none"-->
<!--                                    stroke="currentColor"-->
<!--                                    stroke-width="2"-->
<!--                                    stroke-linecap="round"-->
<!--                                    stroke-linejoin="round"-->
<!--                                    class="ml-1"><path d="m6 9 6 6 6-6" /></svg-->
<!--                                >-->
<!--                            </button>-->
<!--                        </form>-->
<!--                    {:else}-->
<!--                        <div-->
<!--                            class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm"-->
<!--                        >-->
<!--                            <span-->
<!--                                class={`w-2 h-2 rounded-full ${isPublic ? "bg-emerald-500" : "bg-gray-400"}`}-->
<!--                            ></span>-->
<!--                            {isPublic ? "Public" : "Private"}-->
<!--                        </div>-->
<!--                    {/if}-->
<!--                </div>-->

<!--                &lt;!&ndash; Threads Section &ndash;&gt;-->
<!--                <div class="bg-[#f5f5f5] rounded-xl border border-black/5 p-8">-->
<!--                    <h3 class="text-lg font-bold mb-2 text-[#0b0d0b]">-->
<!--                        Threads-->
<!--                    </h3>-->
<!--                    <p class="text-sm text-[#878b86]">-->
<!--                        Share some threads publicly, and they'll show up here.-->
<!--                    </p>-->
<!--                </div>-->

<!--                &lt;!&ndash; Handle Selection (Moved here) &ndash;&gt;-->
<!--                {#if showHandleInput}-->
<!--                    <div-->
<!--                        class="bg-white rounded-xl border border-black/5 p-8 mt-auto"-->
<!--                    >-->
<!--                        <h3 class="text-lg font-semibold mb-2 text-[#0b0d0b]">-->
<!--                            Choose your handle-->
<!--                        </h3>-->
<!--                        <p class="text-[#878b86] text-sm mb-6">-->
<!--                            This will be your unique identity on the platform.-->
<!--                        </p>-->

<!--                        <form-->
<!--                            method="POST"-->
<!--                            action="?/updateHandle"-->
<!--                            use:enhance={() => {-->
<!--                                return async ({ result }) => {-->
<!--                                    if (result.type === "redirect") {-->
<!--                                        showHandleInput = false;-->
<!--                                        showPrivacyPrompt = true;-->
<!--                                    }-->
<!--                                };-->
<!--                            }}-->
<!--                            class="flex gap-2 w-full"-->
<!--                        >-->
<!--                            <div class="relative flex-1">-->
<!--                                <span-->
<!--                                    class="absolute left-4 top-1/2 -translate-y-1/2 text-[#878b86]"-->
<!--                                    >@</span-->
<!--                                >-->
<!--                                <input-->
<!--                                    type="text"-->
<!--                                    name="handle"-->
<!--                                    bind:value={newHandle}-->
<!--                                    placeholder="username"-->
<!--                                    class="w-full bg-white border border-black/10 rounded-lg py-3 pl-8 pr-4 text-[#0b0d0b] placeholder-[#878b86] focus:outline-none focus:border-black/20 focus:ring-1 focus:ring-black/5 transition-all"-->
<!--                                />-->
<!--                            </div>-->
<!--                            <button-->
<!--                                type="submit"-->
<!--                                class="bg-[#0b0d0b] text-white px-6 py-3 rounded-lg font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"-->
<!--                                disabled={!newHandle}-->
<!--                            >-->
<!--                                Save-->
<!--                            </button>-->
<!--                        </form>-->
<!--                    </div>-->
<!--                {/if}-->

<!--                {#if showPrivacyPrompt}-->
<!--                    <div-->
<!--                        class="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm"-->
<!--                    >-->
<!--                        <div-->
<!--                            class="bg-white rounded-xl p-8 max-w-md w-full shadow-xl border border-black/5"-->
<!--                        >-->
<!--                            <h3 class="text-xl font-bold mb-2">-->
<!--                                Make profile public?-->
<!--                            </h3>-->
<!--                            <p class="text-gray-600 mb-6">-->
<!--                                Now that you've set your handle, would you like-->
<!--                                to make your profile visible to everyone?-->
<!--                            </p>-->
<!--                            <div class="flex justify-end gap-3">-->
<!--                                <button-->
<!--                                    on:click={() => (showPrivacyPrompt = false)}-->
<!--                                    class="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-medium"-->
<!--                                >-->
<!--                                    Keep Private-->
<!--                                </button>-->
<!--                                <button-->
<!--                                    on:click={() => {-->
<!--                                        togglePrivacy();-->
<!--                                        showPrivacyPrompt = false;-->
<!--                                    }}-->
<!--                                    class="px-4 py-2 bg-[#0b0d0b] text-white rounded-lg font-medium hover:bg-black/90"-->
<!--                                >-->
<!--                                    Make Public-->
<!--                                </button>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                {/if}-->
<!--            </div>-->
<!--        </div>-->
<!--    {/if}-->
<!--</div>-->

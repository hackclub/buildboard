<script lang="ts">
    let { data } = $props();
</script>

<div class="container mx-auto">
    <h1 class="text-4xl font-bold text-neutral-800 mb-8">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Manage Projects -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
        >
            <h2 class="text-xl font-bold text-neutral-700 mb-4">
                Manage Projects
            </h2>
            <p class="text-neutral-500 mb-6">
                View and manage all user projects.
            </p>
            <button
                class="w-full bg-neutral-800 text-white py-2 rounded-md hover:bg-neutral-700 transition-colors"
            >
                View Projects
            </button>
        </div>

        <!-- Manage Users -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
        >
            <h2 class="text-xl font-bold text-neutral-700 mb-4">
                Manage Users
            </h2>
            <p class="text-neutral-500 mb-6">
                View user details and manage permissions.
            </p>
            <button
                class="w-full bg-neutral-800 text-white py-2 rounded-md hover:bg-neutral-700 transition-colors"
            >
                View Users
            </button>
        </div>

        <!-- System Stats -->
        <div
            class="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
        >
            <h2 class="text-xl font-bold text-neutral-700 mb-4">
                System Stats
            </h2>
            <p class="text-neutral-500 mb-6">
                View platform usage and statistics.
            </p>
            <button
                class="w-full bg-neutral-800 text-white py-2 rounded-md hover:bg-neutral-700 transition-colors"
            >
                View Stats
            </button>
        </div>
    </div>
</div>

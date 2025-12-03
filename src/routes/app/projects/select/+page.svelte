<script>
    const projectTypes = [
        { id: 'website', name: 'Website', color: '#FFBB31', description: 'Build a personal site, tool, or web app' },
        { id: 'game', name: 'Game', color: '#ED0F7E', description: 'Create a video game using any engine' },
        { id: 'mobile', name: 'Mobile App', color: '#A313F0', description: 'Build an app for iOS or Android' },
        { id: 'cli', name: 'Terminal CLI', color: '#1385F0', description: 'Build a command line tool' },
        { id: 'desktop', name: 'Desktop App', color: '#1DCDC2', description: 'Build an app for Windows, Mac, or Linux' },
        { id: 'wildcard', name: 'Wildcard', color: '#F24B4B', description: 'Anything else you can dream of' }
    ];
</script>

<div class="container mx-auto pt-10 px-4">
    <h1 class="text-4xl font-bold text-neutral-700 mb-2">Select a Project Type</h1>
    <p class="text-xl text-neutral-600 mb-8">What kind of project do you want to build?</p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each projectTypes as type}
            <a 
                href="/app/projects/create?type={type.id}" 
                class="block p-6 rounded-lg shadow-lg hover:scale-105 transition-transform bg-white border-l-8"
                style="border-left-color: {type.color}"
            >
                <h2 class="text-2xl font-bold text-neutral-800 mb-2">{type.name}</h2>
                <p class="text-neutral-600">{type.description}</p>
            </a>
        {/each}
    </div>
</div>

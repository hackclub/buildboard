<script lang="ts">
    const projectTypes = [
        { 
            id: 'website', 
            name: 'Website', 
            color: '#FFBB31', 
            description: 'Build a personal site, tool, or web app',
            icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z'
        },
        { 
            id: 'game', 
            name: 'Game', 
            color: '#ED0F7E', 
            description: 'Create a video game using any engine',
            icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z'
        },
        { 
            id: 'mobile', 
            name: 'Mobile App', 
            color: '#A313F0', 
            description: 'Build an app for iOS or Android',
            icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
        },
        { 
            id: 'cli', 
            name: 'Terminal CLI', 
            color: '#1385F0', 
            description: 'Build a command line tool',
            icon: 'M4 17l6-6-6-6M12 19h8'
        },
        { 
            id: 'desktop', 
            name: 'Desktop App', 
            color: '#1DCDC2', 
            description: 'Build an app for Windows, Mac, or Linux',
            icon: 'M2 3h20v14H2zM8 21h8M12 17v4'
        },
        { 
            id: 'wildcard', 
            name: 'Wildcard', 
            color: '#F24B4B', 
            description: 'Anything else you can dream of',
            icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
        }
    ];
</script>

<div class="select-page">
    <a href="/projects" class="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Projects
    </a>

    <header class="page-header">
        <h1>What are you building?</h1>
        <p class="subtitle">Choose a project type to get started</p>
    </header>

    <div class="types-grid">
        {#each projectTypes as type}
            <a href="/projects/create?type={type.id}" class="type-card" style="--accent-color: {type.color}">
                <div class="card-icon" style="background: {type.color}20; border-color: {type.color}40">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={type.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d={type.icon} />
                    </svg>
                </div>
                
                <div class="card-content">
                    <h2>{type.name}</h2>
                    <p>{type.description}</p>
                </div>

                <div class="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </div>

                <div class="accent-bar" style="background: linear-gradient(180deg, {type.color} 0%, {type.color}99 100%)"></div>
            </a>
        {/each}
    </div>
</div>

<style>
    .select-page {
        max-width: 1000px;
        margin: 0 auto;
        padding: 1rem;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--bb-primary);
    }

    .page-header {
        margin-bottom: 2rem;
    }

    .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.5rem;
    }

    .subtitle {
        color: var(--bb-text-muted);
        margin: 0;
        font-size: 1rem;
    }

    .types-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.25rem;
    }

    .type-card {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1.25rem 1.25rem 1.25rem 1.5rem;
        background: linear-gradient(165deg, rgba(46, 34, 33, 0.95) 0%, rgba(35, 25, 24, 0.95) 100%);
        border-radius: 12px;
        border: 1px solid var(--bb-accent-dark);
        text-decoration: none;
        overflow: hidden;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.15),
            0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .type-card:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: var(--accent-color);
        box-shadow: 
            0 8px 24px rgba(0, 0, 0, 0.25),
            0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .accent-bar {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        border-radius: 12px 0 0 12px;
        box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
    }

    .card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        border: 1px solid;
        flex-shrink: 0;
    }

    .card-content {
        flex: 1;
        min-width: 0;
    }

    .card-content h2 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.25rem;
    }

    .card-content p {
        font-size: 0.85rem;
        color: var(--bb-text-muted);
        margin: 0;
        line-height: 1.4;
    }

    .card-arrow {
        color: var(--bb-text-muted);
        opacity: 0;
        transform: translateX(-8px);
        transition: all 0.2s ease;
    }

    .type-card:hover .card-arrow {
        opacity: 1;
        transform: translateX(0);
        color: var(--accent-color);
    }

    @media (max-width: 640px) {
        .types-grid {
            grid-template-columns: 1fr;
        }

        .page-header h1 {
            font-size: 1.5rem;
        }
    }
</style>

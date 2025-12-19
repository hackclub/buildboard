<script lang="ts">
    interface User {
        user_id: string;
        handle: string;
        email: string;
        project_count: number;
        onboarding_completed_at: string | null;
        created_at: string;
    }

    let users = $state<User[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let searchQuery = $state('');
    let currentPage = $state(0);
    let hasMore = $state(true);
    const limit = 50;

    let debounceTimer: ReturnType<typeof setTimeout>;

    async function fetchUsers(page: number, query: string) {
        loading = true;
        error = null;
        try {
            const params = new URLSearchParams({
                skip: (page * limit).toString(),
                limit: limit.toString()
            });
            if (query) params.set('q', query);
            const res = await fetch(`/api/admin/users?${params}`);
            if (!res.ok) throw new Error('Failed to fetch users');
            users = await res.json();
            hasMore = users.length === limit;
        } catch (e) {
            error = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            loading = false;
        }
    }

    function goToPage(page: number) {
        currentPage = page;
        fetchUsers(page, searchQuery);
    }

    function handleSearch(query: string) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentPage = 0;
            fetchUsers(0, query);
        }, 300);
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    $effect(() => {
        fetchUsers(0, '');
    });

    $effect(() => {
        handleSearch(searchQuery);
    });
</script>

<div class="page-container">
    <header class="page-header">
        <div>
            <h1>Users</h1>
            <p>Manage all platform users</p>
        </div>
        <a href="/admin" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Dashboard
        </a>
    </header>

    <div class="filters-card">
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search by handle or email..."
            class="search-input"
        />
    </div>

    {#if loading}
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading users...</p>
        </div>
    {:else if error}
        <div class="error-card">
            <p>{error}</p>
            <button class="btn-secondary" onclick={() => { error = null; fetchUsers(currentPage, searchQuery); }}>Dismiss</button>
        </div>
    {:else if users.length === 0}
        <div class="empty-state">
            <p>No users found</p>
        </div>
    {:else}
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Handle</th>
                        <th>Email</th>
                        <th>Projects</th>
                        <th>Onboarding</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {#each users as user}
                        <tr>
                            <td>
                                <a href="/admin/users/{user.user_id}" class="user-link">
                                    @{user.handle || 'unknown'}
                                </a>
                            </td>
                            <td class="email-cell">{user.email || '—'}</td>
                            <td>
                                <span class="project-count" class:has-projects={user.project_count > 0}>
                                    {user.project_count}
                                </span>
                            </td>
                            <td>
                                {#if user.onboarding_completed_at}
                                    <span class="status-complete">Complete</span>
                                {:else}
                                    <span class="status-pending">In Progress</span>
                                {/if}
                            </td>
                            <td class="date-cell">{formatDate(user.created_at)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="pagination">
            <span class="pagination-info">Page {currentPage + 1}</span>
            <div class="pagination-btns">
                <button class="btn-secondary" onclick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}>Previous</button>
                <button class="btn-secondary" onclick={() => goToPage(currentPage + 1)} disabled={!hasMore}>Next</button>
            </div>
        </div>
    {/if}
</div>

<style>
    .page-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 1rem 3rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 0.5rem 0 1.5rem;
    }

    .page-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.25rem;
    }

    .page-header p {
        font-size: 1rem;
        color: var(--bb-text-muted);
        margin: 0;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--bb-primary);
    }

    .filters-card {
        background: rgba(46, 34, 33, 0.95);
        padding: 1rem;
        margin-bottom: 1rem;
    }

    .search-input {
        width: 100%;
        max-width: 400px;
        padding: 0.6rem 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
        font-size: 0.9rem;
    }

    .search-input::placeholder {
        color: var(--bb-text-muted);
    }

    .loading-state, .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        gap: 1rem;
        color: var(--bb-text-muted);
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--bb-accent-dark);
        border-top-color: var(--bb-primary);
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-card {
        background: rgba(220, 38, 38, 0.1);
        border: 1px solid rgba(220, 38, 38, 0.3);
        padding: 1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .error-card p {
        color: #fca5a5;
        margin: 0;
    }

    .table-card {
        background: rgba(46, 34, 33, 0.95);
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 0.75rem 1rem;
        text-align: left;
    }

    th {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--bb-text-muted);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        font-size: 0.9rem;
    }

    tr:hover td {
        background: rgba(255, 255, 255, 0.02);
    }

    .user-link {
        color: var(--bb-text-primary);
        text-decoration: none;
        font-weight: 500;
    }

    .user-link:hover {
        color: var(--bb-primary);
    }

    .email-cell {
        color: var(--bb-text-muted);
        font-size: 0.85rem;
    }

    .project-count {
        color: var(--bb-text-muted);
    }

    .project-count.has-projects {
        color: var(--bb-primary);
        font-weight: 600;
    }

    .status-complete {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        background: rgba(74, 222, 128, 0.2);
        color: #4ade80;
        font-size: 0.75rem;
        font-weight: 600;
    }

    .status-pending {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-muted);
        font-size: 0.75rem;
    }

    .date-cell {
        color: var(--bb-text-muted);
        font-size: 0.85rem;
    }

    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
    }

    .pagination-info {
        color: var(--bb-text-muted);
        font-size: 0.9rem;
    }

    .pagination-btns {
        display: flex;
        gap: 0.5rem;
    }

    .btn-secondary {
        padding: 0.6rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-secondary);
        font-weight: 500;
        font-size: 0.85rem;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
    }

    .btn-secondary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>

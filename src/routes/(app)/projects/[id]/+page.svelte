<script lang="ts">
    import type { PageData } from "./$types";
    import ReadmeEditor from "$lib/components/ReadmeEditor.svelte";
    import HackatimeSelector from "$lib/components/HackatimeSelector.svelte";

    export let data: PageData;

    let { project, readme } = data;

    let isEditing = false;
    let editName = project.project_name;
    let editDescription = project.project_description || "";
    let saving = false;
    let saveError = "";

    let submitting = false;
    let submitErrors: Array<{ field: string; message: string }> = [];
    let showSubmitConfirm = false;

    async function submitProject() {
        submitting = true;
        submitErrors = [];

        try {
            const res = await fetch(`/api/projects/${project.project_id}/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit");
            }

            const result = await res.json();
            
            if (!result.success) {
                submitErrors = result.errors || [];
                return;
            }

            project = { ...project, shipped: result.shipped };
            showSubmitConfirm = false;
        } catch (e: any) {
            submitErrors = [{ field: "general", message: e.message }];
        } finally {
            submitting = false;
        }
    }

    let isEditingHackatime = false;
    let hackatimeKeys: string[] = project.hackatime_projects || [];
    let savingHackatime = false;
    let hackatimeError = "";
    
    function getSafeUrl(url: string | null | undefined): string | null {
        if (!url) return null;
        try {
            const parsed = new URL(url);
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                return url;
            }
            return null;
        } catch {
            return null;
        }
    }
    
    $: safeLiveUrl = getSafeUrl(project.live_url);
    $: safeCodeUrl = getSafeUrl(project.code_url);

    $: hasGithub = !!(project.code_url || project.github_repo_path);
    $: hasLiveUrl = !!project.live_url;
    $: hasScreenshot = !!(project.attachment_urls && project.attachment_urls.length > 0);
    $: hasHackatime = !!(project.hackatime_projects && project.hackatime_projects.length > 0);
    $: requirementsMet = hasGithub && hasLiveUrl && hasScreenshot && hasHackatime;

    let linking = false;
    let repoInput = "";
    let linkMessage = "";
    let linkError = "";

    let isEditingUrls = false;
    let editLiveUrl = project.live_url || "";
    let editCodeUrl = project.code_url || "";
    let savingUrls = false;
    let urlError = "";

    async function saveUrls() {
        savingUrls = true;
        urlError = "";

        try {
            const res = await fetch(`/api/projects/${project.project_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    live_url: editLiveUrl.trim() || null,
                    code_url: editCodeUrl.trim() || null
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save");
            }

            const updated = await res.json();
            project = { ...project, ...updated };
            isEditingUrls = false;
        } catch (e: any) {
            urlError = e.message;
        } finally {
            savingUrls = false;
        }
    }

    function cancelUrlEdit() {
        editLiveUrl = project.live_url || "";
        editCodeUrl = project.code_url || "";
        urlError = "";
        isEditingUrls = false;
    }

    let isEditingScreenshots = false;
    let screenshotUrl = "";
    let savingScreenshot = false;
    let screenshotError = "";

    async function addScreenshot() {
        if (!screenshotUrl.trim()) {
            screenshotError = "Please enter a screenshot URL";
            return;
        }

        savingScreenshot = true;
        screenshotError = "";

        try {
            const currentUrls = project.attachment_urls || [];
            const res = await fetch(`/api/projects/${project.project_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    attachment_urls: [...currentUrls, screenshotUrl.trim()]
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save");
            }

            const updated = await res.json();
            project = { ...project, ...updated };
            screenshotUrl = "";
            isEditingScreenshots = false;
        } catch (e: any) {
            screenshotError = e.message;
        } finally {
            savingScreenshot = false;
        }
    }

    async function removeScreenshot(url: string) {
        try {
            const currentUrls = project.attachment_urls || [];
            const res = await fetch(`/api/projects/${project.project_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    attachment_urls: currentUrls.filter((u: string) => u !== url)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to remove");
            }

            const updated = await res.json();
            project = { ...project, ...updated };
        } catch (e: any) {
            screenshotError = e.message;
        }
    }

    function formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    }

    function formatHours(hours: number | null | undefined): string {
        if (!hours) return "0h 0m";
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    }

    async function saveProject() {
        if (!editName.trim()) {
            saveError = "Project name is required";
            return;
        }

        saving = true;
        saveError = "";

        try {
            const res = await fetch(`/api/projects/${project.project_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project_name: editName.trim(),
                    project_description: editDescription.trim()
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save");
            }

            const updated = await res.json();
            project = { ...project, ...updated };
            isEditing = false;
        } catch (e: any) {
            saveError = e.message;
        } finally {
            saving = false;
        }
    }

    function cancelEdit() {
        editName = project.project_name;
        editDescription = project.project_description || "";
        saveError = "";
        isEditing = false;
    }

    async function saveHackatimeProjects() {
        savingHackatime = true;
        hackatimeError = "";

        try {
            const res = await fetch(`/api/projects/${project.project_id}/hackatime-projects`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectNames: hackatimeKeys })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save");
            }

            const updated = await res.json();
            project = { ...project, ...updated };
            isEditingHackatime = false;
        } catch (e: any) {
            hackatimeError = e.message;
        } finally {
            savingHackatime = false;
        }
    }

    function cancelHackatimeEdit() {
        hackatimeKeys = project.hackatime_projects || [];
        hackatimeError = "";
        isEditingHackatime = false;
    }

    async function linkRepo() {
        if (!repoInput.trim()) {
            linkError = "Please enter a GitHub repository";
            return;
        }

        linking = true;
        linkError = "";
        linkMessage = "";

        try {
            const response = await fetch(
                `/api/projects/${project.project_id}/github/link`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        repo_path: repoInput.trim(),
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.detail || "Failed to link repository",
                );
            }

            linkMessage = "Repository linked successfully! Refreshing...";
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (e: any) {
            linkError = e.message;
        } finally {
            linking = false;
        }
    }
</script>

<div class="page-container">
    <!-- Back Link -->
    <a href="/projects" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Projects
    </a>

    <!-- Project Header Card -->
    <div class="card header-card">
        <div class="card-top-row">
            <div class="project-badge">Week {project.submission_week}</div>
            {#if !isEditing}
                <button class="edit-btn" on:click={() => isEditing = true}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                </button>
            {/if}
        </div>
        
        {#if isEditing}
            <div class="edit-form">
                <div class="form-group">
                    <label for="edit-name">Project Name</label>
                    <input
                        id="edit-name"
                        type="text"
                        bind:value={editName}
                        placeholder="Project name"
                        maxlength="200"
                    />
                </div>
                <div class="form-group">
                    <label for="edit-description">Description</label>
                    <textarea
                        id="edit-description"
                        bind:value={editDescription}
                        placeholder="Project description"
                        rows="3"
                    ></textarea>
                </div>
                {#if saveError}
                    <div class="form-error">{saveError}</div>
                {/if}
                <div class="edit-actions">
                    <button class="btn-secondary" on:click={cancelEdit} disabled={saving}>Cancel</button>
                    <button class="btn-primary" on:click={saveProject} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        {:else}
            <h1>{project.project_name}</h1>
            {#if project.project_description}
                <p class="project-description">{project.project_description}</p>
            {/if}
        {/if}

        <div class="stats-row">
            <div class="stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                </svg>
                <span class="stat-value">{formatHours(project.hackatime_hours)}</span>
                <span class="stat-label">logged</span>
            </div>
        </div>

        <div class="project-links">
            {#if safeLiveUrl}
                <a href={safeLiveUrl} target="_blank" rel="noopener noreferrer" class="link-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15,3 21,3 21,9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Live Demo
                </a>
            {/if}
            {#if safeCodeUrl}
                <a href={safeCodeUrl} target="_blank" rel="noopener noreferrer" class="link-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                    </svg>
                    Source Code
                </a>
            {/if}
        </div>

        <!-- Submit Section -->
        <div class="submit-section">
            {#if project.shipped}
                <div class="shipped-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                    </svg>
                    Project Submitted
                </div>
            {:else if showSubmitConfirm}
                <div class="submit-confirm">
                    <p>Are you sure you want to submit this project for review?</p>
                    <p class="submit-requirements">Requirements: Under 19, complete profile with birthday, shipping address, linked Hackatime project, GitHub repo URL, live URL, and screenshot.</p>
                    {#if submitErrors.length > 0}
                        <div class="validation-errors">
                            <p class="error-title">Please fix the following issues:</p>
                            <ul>
                                {#each submitErrors as error}
                                    <li>{error.message}</li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                    <div class="submit-actions">
                        <button class="btn-secondary" on:click={() => { showSubmitConfirm = false; submitErrors = []; }} disabled={submitting}>
                            Cancel
                        </button>
                        <button class="btn-submit" on:click={submitProject} disabled={submitting}>
                            {submitting ? "Validating..." : "Yes, Submit"}
                        </button>
                    </div>
                </div>
            {:else}
                <button class="btn-submit" on:click={() => showSubmitConfirm = true}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                    Submit Project
                </button>
            {/if}
        </div>
    </div>

    <!-- Submission Requirements Checklist -->
    {#if !project.shipped}
        <div class="card requirements-card">
            <div class="card-header">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                    Submission Requirements
                </h2>
                {#if requirementsMet}
                    <span class="requirements-ready">Ready to submit!</span>
                {/if}
            </div>
            
            <ul class="requirements-list">
                <li class:completed={hasGithub}>
                    <span class="check-icon">
                        {#if hasGithub}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        {:else}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        {/if}
                    </span>
                    <span class="req-text">GitHub repository URL</span>
                    {#if !hasGithub}
                        <span class="req-action">Link below</span>
                    {/if}
                </li>
                <li class:completed={hasLiveUrl}>
                    <span class="check-icon">
                        {#if hasLiveUrl}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        {:else}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        {/if}
                    </span>
                    <span class="req-text">Live/playable project URL</span>
                    {#if !hasLiveUrl}
                        <a href="#urls" class="req-action">Add URL</a>
                    {/if}
                </li>
                <li class:completed={hasScreenshot}>
                    <span class="check-icon">
                        {#if hasScreenshot}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        {:else}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        {/if}
                    </span>
                    <span class="req-text">At least one screenshot</span>
                    {#if !hasScreenshot}
                        <a href="#screenshots" class="req-action">Upload</a>
                    {/if}
                </li>
                <li class:completed={hasHackatime}>
                    <span class="check-icon">
                        {#if hasHackatime}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                <polyline points="22,4 12,14.01 9,11.01" />
                            </svg>
                        {:else}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        {/if}
                    </span>
                    <span class="req-text">Linked Hackatime project</span>
                    {#if !hasHackatime}
                        <a href="#hackatime" class="req-action">Link project</a>
                    {/if}
                </li>
            </ul>
            
            <p class="requirements-note">You also need a complete profile, address, and be under 19 to submit.</p>
        </div>
    {/if}

    <!-- Hackatime Projects Card -->
    <div class="card" id="hackatime">
        <div class="card-header">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                </svg>
                Hackatime Projects
            </h2>
            {#if !isEditingHackatime}
                <button class="edit-btn-small" on:click={() => isEditingHackatime = true}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                </button>
            {/if}
        </div>

        {#if isEditingHackatime}
            <div class="hackatime-edit">
                <HackatimeSelector bind:selectedKeys={hackatimeKeys} />
                {#if hackatimeError}
                    <div class="form-error">{hackatimeError}</div>
                {/if}
                <div class="edit-actions">
                    <button class="btn-secondary" on:click={cancelHackatimeEdit} disabled={savingHackatime}>Cancel</button>
                    <button class="btn-primary" on:click={saveHackatimeProjects} disabled={savingHackatime}>
                        {savingHackatime ? "Saving..." : "Save Hackatime Projects"}
                    </button>
                </div>
            </div>
        {:else if project.hackatime_projects && project.hackatime_projects.length > 0}
            <div class="hackatime-list">
                {#each project.hackatime_projects as name}
                    <span class="hackatime-tag">{name}</span>
                {/each}
            </div>
        {:else}
            <p class="empty-hint">No Hackatime projects linked yet. Click Edit to add some.</p>
        {/if}
    </div>

    <!-- GitHub Integration Card -->
    <div class="card" id="github">
        <div class="card-header">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                </svg>
                GitHub Integration
            </h2>
        </div>

        {#if project.github_installation_id && project.github_repo_path}
            <div class="linked-repo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
                <span>Linked to <strong>{project.github_repo_path}</strong></span>
            </div>

            <div class="readme-section">
                <ReadmeEditor
                    projectId={project.project_id}
                    initialContent={readme?.content || ""}
                    initialSha={readme?.sha || null}
                />
            </div>
        {:else}
            <div class="link-form">
                <p class="form-hint">
                    Link a GitHub repository to enable README editing and sync.
                </p>

                <div class="form-group">
                    <label for="repo-input">GitHub Repository</label>
                    <input
                        id="repo-input"
                        type="text"
                        bind:value={repoInput}
                        placeholder="owner/repo or https://github.com/owner/repo"
                    />
                    <p class="input-help">
                        Paste a GitHub URL or enter owner/repo
                    </p>
                </div>

                {#if linkError}
                    <div class="form-error">{linkError}</div>
                {/if}
                {#if linkMessage}
                    <div class="form-success">{linkMessage}</div>
                {/if}

                <button
                    class="btn-primary"
                    on:click={linkRepo}
                    disabled={linking || !repoInput.trim()}
                >
                    {linking ? "Linking..." : "Link Repository"}
                </button>
            </div>
        {/if}
    </div>

    <!-- Project URLs Card -->
    <div class="card" id="urls">
        <div class="card-header">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                Project URLs
            </h2>
            {#if !isEditingUrls}
                <button class="edit-btn-small" on:click={() => isEditingUrls = true}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                </button>
            {/if}
        </div>

        {#if isEditingUrls}
            <div class="urls-edit">
                <div class="form-group">
                    <label for="edit-live-url">Live/Playable URL <span class="required-tag">Required</span></label>
                    <input
                        id="edit-live-url"
                        type="url"
                        bind:value={editLiveUrl}
                        placeholder="https://your-project.com"
                    />
                </div>
                <div class="form-group">
                    <label for="edit-code-url">Source Code URL</label>
                    <input
                        id="edit-code-url"
                        type="url"
                        bind:value={editCodeUrl}
                        placeholder="https://github.com/you/project"
                    />
                </div>
                {#if urlError}
                    <div class="form-error">{urlError}</div>
                {/if}
                <div class="edit-actions">
                    <button class="btn-secondary" on:click={cancelUrlEdit} disabled={savingUrls}>Cancel</button>
                    <button class="btn-primary" on:click={saveUrls} disabled={savingUrls}>
                        {savingUrls ? "Saving..." : "Save URLs"}
                    </button>
                </div>
            </div>
        {:else}
            <div class="urls-display">
                <div class="url-row">
                    <span class="url-label">Live URL:</span>
                    {#if project.live_url}
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" class="url-value">{project.live_url}</a>
                    {:else}
                        <span class="url-missing">Not set <span class="required-tag">Required</span></span>
                    {/if}
                </div>
                <div class="url-row">
                    <span class="url-label">Code URL:</span>
                    {#if project.code_url}
                        <a href={project.code_url} target="_blank" rel="noopener noreferrer" class="url-value">{project.code_url}</a>
                    {:else}
                        <span class="url-missing">Not set</span>
                    {/if}
                </div>
            </div>
        {/if}
    </div>

    <!-- Screenshots Card -->
    <div class="card" id="screenshots">
        <div class="card-header">
            <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                </svg>
                Screenshots <span class="required-tag">Required</span>
            </h2>
            <button class="edit-btn-small" on:click={() => isEditingScreenshots = !isEditingScreenshots}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add
            </button>
        </div>

        {#if isEditingScreenshots}
            <div class="screenshot-add">
                <div class="form-group">
                    <label for="screenshot-url">Screenshot URL</label>
                    <input
                        id="screenshot-url"
                        type="url"
                        bind:value={screenshotUrl}
                        placeholder="https://example.com/screenshot.png"
                    />
                    <p class="input-help">Upload your image to an image host and paste the URL here</p>
                </div>
                {#if screenshotError}
                    <div class="form-error">{screenshotError}</div>
                {/if}
                <div class="edit-actions">
                    <button class="btn-secondary" on:click={() => { isEditingScreenshots = false; screenshotUrl = ""; screenshotError = ""; }} disabled={savingScreenshot}>Cancel</button>
                    <button class="btn-primary" on:click={addScreenshot} disabled={savingScreenshot || !screenshotUrl.trim()}>
                        {savingScreenshot ? "Adding..." : "Add Screenshot"}
                    </button>
                </div>
            </div>
        {/if}

        {#if project.attachment_urls && project.attachment_urls.length > 0}
            <div class="screenshots-grid">
                {#each project.attachment_urls as url}
                    <div class="screenshot-item">
                        <img src={url} alt="Project screenshot" />
                        <button class="screenshot-remove" on:click={() => removeScreenshot(url)} title="Remove screenshot">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                {/each}
            </div>
        {:else if !isEditingScreenshots}
            <p class="empty-hint">No screenshots uploaded yet. Click Add to upload one.</p>
        {/if}
    </div>
</div>

<style>
    .page-container {
        max-width: 700px;
        margin: 0 auto;
        padding: 0 1rem 3rem;
    }

    /* Back Link */
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
        font-size: 0.9rem;
        text-decoration: none;
        margin-bottom: 1.5rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--bb-primary);
    }

    /* Cards */
    .card {
        background: rgba(46, 34, 33, 0.95);
        border-radius: 0;
        padding: 1.5rem 2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.25rem;
    }

    .card-header h2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--bb-text-primary);
        margin: 0;
    }

    .card-top-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    /* Header Card */
    .header-card {
        padding: 2rem;
    }

    .project-badge {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--bb-primary);
        background: rgba(255, 184, 89, 0.15);
        padding: 0.35rem 0.75rem;
        border-radius: 0;
    }

    .edit-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.4rem 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
        color: var(--bb-text-muted);
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .edit-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
        border-color: var(--bb-primary);
    }

    .edit-btn-small {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.3rem 0.6rem;
        background: transparent;
        border: none;
        color: var(--bb-text-muted);
        font-size: 0.75rem;
        cursor: pointer;
        transition: color 0.2s;
    }

    .edit-btn-small:hover {
        color: var(--bb-primary);
    }

    .header-card h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--bb-text-primary);
        margin: 0 0 0.5rem;
    }

    .project-description {
        font-size: 1rem;
        color: var(--bb-text-muted);
        margin: 0 0 1.5rem;
        line-height: 1.5;
    }

    .stats-row {
        display: flex;
        gap: 1.5rem;
        padding: 1rem 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 1.5rem;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--bb-text-muted);
    }

    .stat svg {
        color: var(--bb-primary);
    }

    .stat-value {
        font-weight: 700;
        color: var(--bb-text-primary);
    }

    .stat-label {
        font-size: 0.85rem;
    }

    .project-links {
        display: flex;
        gap: 0.75rem;
    }

    .link-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
        color: var(--bb-text-secondary);
        font-size: 0.9rem;
        text-decoration: none;
        transition: all 0.2s;
    }

    .link-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--bb-primary);
        color: var(--bb-text-primary);
    }

    /* Submit Section */
    .submit-section {
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem 1.5rem;
        background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
        color: #fff;
        font-weight: 600;
        font-size: 0.95rem;
        border: none;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .btn-submit:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 
            0 4px 12px rgba(34, 197, 94, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .shipped-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: rgba(34, 84, 61, 0.3);
        border: 1px solid rgba(34, 197, 94, 0.5);
        border-radius: 0;
        color: #86efac;
        font-size: 0.9rem;
        font-weight: 600;
    }

    .shipped-badge svg {
        color: #22c55e;
    }

    /* Requirements Card */
    .requirements-card {
        border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .requirements-ready {
        font-size: 0.75rem;
        font-weight: 600;
        color: #22c55e;
        background: rgba(34, 197, 94, 0.15);
        padding: 0.25rem 0.5rem;
        border-radius: 0;
    }

    .requirements-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .requirements-list li {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--bb-text-muted);
    }

    .requirements-list li:last-child {
        border-bottom: none;
    }

    .requirements-list li.completed {
        color: var(--bb-text-secondary);
    }

    .requirements-list li.completed .check-icon {
        color: #22c55e;
    }

    .check-icon {
        display: flex;
        align-items: center;
        color: var(--bb-text-muted);
    }

    .req-text {
        flex: 1;
        font-size: 0.9rem;
    }

    .req-action {
        font-size: 0.8rem;
        color: #60a5fa;
        text-decoration: none;
        cursor: pointer;
    }

    .req-action:hover {
        text-decoration: underline;
    }

    .requirements-note {
        margin: 1rem 0 0;
        font-size: 0.8rem;
        color: var(--bb-text-muted);
        font-style: italic;
    }

    /* Required Tag */
    .required-tag {
        font-size: 0.7rem;
        font-weight: 600;
        color: #f97316;
        background: rgba(249, 115, 22, 0.15);
        padding: 0.15rem 0.4rem;
        border-radius: 0;
        margin-left: 0.5rem;
    }

    /* URLs Card */
    .urls-edit {
        padding-top: 0.5rem;
    }

    .urls-display {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .url-row {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .url-label {
        font-size: 0.85rem;
        color: var(--bb-text-muted);
        min-width: 80px;
    }

    .url-value {
        font-size: 0.85rem;
        color: #60a5fa;
        word-break: break-all;
        text-decoration: none;
    }

    .url-value:hover {
        text-decoration: underline;
    }

    .url-missing {
        font-size: 0.85rem;
        color: var(--bb-text-muted);
        font-style: italic;
    }

    /* Screenshots Card */
    .screenshot-add {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .screenshots-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .screenshot-item {
        position: relative;
        aspect-ratio: 16 / 9;
        border-radius: 0;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--bb-accent-dark);
    }

    .screenshot-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .screenshot-remove {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.7);
        border: none;
        border-radius: 0;
        color: #fca5a5;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .screenshot-item:hover .screenshot-remove {
        opacity: 1;
    }

    .screenshot-remove:hover {
        background: rgba(185, 28, 28, 0.8);
        color: #fff;
    }

    .submit-confirm {
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
    }

    .submit-confirm p {
        margin: 0 0 1rem;
        font-size: 0.9rem;
        color: var(--bb-text-secondary);
    }

    .submit-requirements {
        font-size: 0.8rem !important;
        color: var(--bb-text-muted) !important;
        font-style: italic;
    }

    .validation-errors {
        padding: 1rem;
        background: rgba(127, 29, 29, 0.2);
        border: 1px solid rgba(185, 28, 28, 0.5);
        border-radius: 0;
        margin-bottom: 1rem;
    }

    .validation-errors .error-title {
        margin: 0 0 0.5rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: #fca5a5;
    }

    .validation-errors ul {
        margin: 0;
        padding-left: 1.25rem;
    }

    .validation-errors li {
        font-size: 0.85rem;
        color: #fca5a5;
        margin-bottom: 0.25rem;
    }

    .validation-errors li:last-child {
        margin-bottom: 0;
    }

    .submit-actions {
        display: flex;
        gap: 0.75rem;
    }

    /* Edit Form */
    .edit-form {
        margin-bottom: 1.5rem;
    }

    .edit-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    /* Hackatime */
    .hackatime-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .hackatime-tag {
        display: inline-block;
        padding: 0.4rem 0.75rem;
        background: rgba(255, 184, 89, 0.15);
        border: 1px solid rgba(255, 184, 89, 0.3);
        border-radius: 0;
        color: var(--bb-primary);
        font-size: 0.85rem;
        font-weight: 500;
    }

    .hackatime-edit {
        padding-top: 0.5rem;
    }

    .empty-hint {
        font-size: 0.9rem;
        color: var(--bb-text-muted);
        font-style: italic;
        margin: 0;
    }

    /* Linked Repo */
    .linked-repo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.875rem 1rem;
        background: rgba(34, 84, 61, 0.3);
        border: 1px solid rgba(34, 84, 61, 0.5);
        border-radius: 0;
        color: #86efac;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
    }

    .linked-repo strong {
        color: #bbf7d0;
    }

    .readme-section {
        margin-top: 1rem;
    }

    /* Link Form */
    .link-form {
        max-width: 400px;
    }

    .form-hint {
        font-size: 0.9rem;
        color: var(--bb-text-muted);
        margin: 0 0 1.25rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    .form-group label {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--bb-text-secondary);
        margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 0.65rem 0.875rem;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid var(--bb-accent-dark);
        border-radius: 0;
        color: var(--bb-text-primary);
        font-size: 0.9rem;
        font-family: inherit;
        transition: border-color 0.2s;
    }

    .form-group textarea {
        resize: vertical;
        min-height: 80px;
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
        color: var(--bb-text-muted);
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--bb-primary);
    }

    .input-help {
        font-size: 0.8rem;
        color: var(--bb-text-muted);
        margin: 0.5rem 0 0;
    }

    .form-error {
        padding: 0.65rem 0.875rem;
        background: rgba(127, 29, 29, 0.3);
        border: 1px solid rgba(185, 28, 28, 0.5);
        border-radius: 0;
        color: #fca5a5;
        font-size: 0.85rem;
        margin-bottom: 1rem;
    }

    .form-success {
        padding: 0.65rem 0.875rem;
        background: rgba(34, 84, 61, 0.3);
        border: 1px solid rgba(34, 84, 61, 0.5);
        border-radius: 0;
        color: #86efac;
        font-size: 0.85rem;
        margin-bottom: 1rem;
    }

    .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: linear-gradient(180deg, var(--bb-primary) 0%, var(--bb-primary-dark) 100%);
        color: var(--bb-bg-dark);
        font-weight: 600;
        font-size: 0.9rem;
        border: none;
        border-radius: 0;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .btn-primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: rgba(255, 255, 255, 0.05);
        color: var(--bb-text-secondary);
        font-weight: 500;
        font-size: 0.9rem;
        border: 1px solid var(--bb-accent-dark);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .btn-secondary:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        color: var(--bb-text-primary);
    }

    .btn-secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 640px) {
        .card {
            padding: 1.25rem;
        }

        .header-card {
            padding: 1.5rem 1.25rem;
        }

        .header-card h1 {
            font-size: 1.5rem;
        }

        .project-links {
            flex-direction: column;
        }

        .edit-actions {
            flex-direction: column;
        }

        .btn-primary, .btn-secondary {
            width: 100%;
        }
    }
</style>

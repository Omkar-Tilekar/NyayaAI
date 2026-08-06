// Base configuration
const API_BASE_URL = "http://localhost:8000/api/v1";

// 🟡 SAFE TO COPY: Tab Switching Logic
document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".nav-btn");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            contents.forEach(c => c.classList.remove("active"));

            tab.classList.add("active");
            const activeTabId = tab.getAttribute("data-tab");
            document.getElementById(activeTabId).classList.add("active");
        });
    });

    // Setup Drafting sub-tabs
    const draftTabs = document.querySelectorAll(".draft-tab-btn");
    draftTabs.forEach(dTab => {
        dTab.addEventListener("click", () => {
            draftTabs.forEach(t => t.classList.remove("active"));
            dTab.classList.add("active");
            renderActiveDraftSection();
        });
    });

    // Bind action events
    document.getElementById("btn-search").addEventListener("click", handleSearch);
    document.getElementById("btn-draft").addEventListener("click", handleDraftCompile);
    document.getElementById("btn-ingest").addEventListener("click", handleIngestionSubmit);
    document.getElementById("btn-copy-draft").addEventListener("click", copyDraftToClipboard);
});

// Cache storage for active drafting outputs
let currentDrafts = null;

// =====================================================================
// 🟢 TYPE YOURSELF: Hand-type this client-server integration logic.
//
// Why this block exists: To fetch dynamic JSON records from the FastAPI
// backend using asynchronous JavaScript (async/await and fetch APIs).
//
// Common mistake: Forgetting to stringify request bodies or forgetting to 
// include headers like "Content-Type": "application/json".
// =====================================================================

// 1. Research Fetch Handler
async function handleSearch() {
    const query = document.getElementById("search-query").value.trim();
    if (!query) return;

    const resultsContainer = document.getElementById("search-results");
    resultsContainer.innerHTML = '<div class="empty-state"><p>Querying backend databases...</p></div>';

    // 🟢 Hand-type the fetch block below:
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/research/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Search request failed.");
        
        const data = await response.json();
        renderSearchResults(data.results);
    } catch (error) {
        resultsContainer.innerHTML = `<div class="empty-state"><p style="color:#ef4444;">Error: ${error.message}</p></div>`;
    }
    */
}

// 2. Document Fetch Handler (Details lookup)
async function fetchFullDocument(mongoId) {
    const viewerBody = document.getElementById("document-text");
    const badge = document.getElementById("doc-citation-badge");
    
    viewerBody.innerHTML = '<p>Retrieving case context from MongoDB...</p>';
    badge.innerText = "Connecting...";

    // 🟢 Hand-type the document retrieval fetch below:
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/research/document/${mongoId}`);
        if (!response.ok) throw new Error("Could not retrieve document.");
        
        const data = await response.json();
        viewerBody.innerText = data.full_text;
        badge.innerText = data.citation;
    } catch (error) {
        viewerBody.innerText = `Error: ${error.message}`;
        badge.innerText = "Error";
    }
    */
}

// 3. Drafting Fetch Handler
async function handleDraftCompile() {
    const facts = document.getElementById("draft-facts").value.trim();
    const offences = document.getElementById("draft-offences").value.trim();
    
    if (!facts) {
        alert("Please enter case facts first.");
        return;
    }

    const outputDisplay = document.getElementById("draft-text-display");
    outputDisplay.innerHTML = '<div class="empty-state"><p>Compiling petition sections via LLM pipeline...</p></div>';

    // 🟢 Hand-type the POST request to drafting API below:
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/drafting/draft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ facts: facts, offences: offences })
        });
        
        if (!response.ok) throw new Error("Drafting compilation failed.");
        
        const data = await response.json();
        currentDrafts = data.drafts;
        renderActiveDraftSection();
    } catch (error) {
        outputDisplay.innerHTML = `<div class="empty-state"><p style="color:#ef4444;">Error: ${error.message}</p></div>`;
    }
    */
}

// 4. Ingestion Fetch Handler
async function handleIngestionSubmit() {
    const title = document.getElementById("ingest-title").value.trim();
    const citation = document.getElementById("ingest-citation").value.trim();
    const text = document.getElementById("ingest-text").value.trim();

    if (!title || !citation || !text) {
        alert("All fields are required for ingestion.");
        return;
    }

    const jobsContainer = document.getElementById("ingest-jobs");
    if (jobsContainer.querySelector(".empty-state")) {
        jobsContainer.innerHTML = '';
    }

    // 🟢 Hand-type the background job dispatch fetch below:
    /*
    try {
        const response = await fetch(`${API_BASE_URL}/admin/ingest`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, citation, text })
        });
        
        if (!response.ok) throw new Error("Ingestion dispatch failed.");
        
        const data = await response.json();
        addIngestionJobToQueue(title, data.mongo_id, data.status);
    } catch (error) {
        alert(`Ingestion Error: ${error.message}`);
    }
    */
}

// =====================================================================
// 🟡 SAFE TO COPY: UI Rendering Helpers
// =====================================================================

function renderSearchResults(results) {
    const container = document.getElementById("search-results");
    container.innerHTML = "";

    if (!results || results.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No matching criminal case records found.</p></div>';
        return;
    }

    results.forEach(item => {
        const card = document.createElement("div");
        card.className = "result-card";
        card.innerHTML = `
            <h4>${item.title}</h4>
            <p>${item.snippet}</p>
            <div class="meta">
                <span class="badge secondary">${item.citation}</span>
                <span>Match Score: ${(item.relevance_score * 100).toFixed(0)}%</span>
            </div>
        `;
        card.addEventListener("click", () => fetchFullDocument(item.mongo_id));
        container.appendChild(card);
    });
}

function renderActiveDraftSection() {
    const display = document.getElementById("draft-text-display");
    if (!currentDrafts) return;

    const activeSubTab = document.querySelector(".draft-tab-btn.active");
    const sectionKey = activeSubTab.getAttribute("data-draft-sec");

    display.innerText = currentDrafts[sectionKey] || "Section empty.";
}

function addIngestionJobToQueue(title, mongoId, status) {
    const queue = document.getElementById("ingest-jobs");
    const item = document.createElement("div");
    item.className = "job-item";
    item.innerHTML = `
        <div>
            <div class="title">${title}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Ref ID: ${mongoId}</div>
        </div>
        <span class="status-badge processing">${status.toUpperCase()}</span>
    `;
    queue.prepend(item);

    // Mock completion transition
    setTimeout(() => {
        const badge = item.querySelector(".status-badge");
        badge.className = "status-badge done";
        badge.innerText = "DONE";
    }, 4000);
}

function copyDraftToClipboard() {
    const display = document.getElementById("draft-text-display");
    if (display.querySelector(".empty-state")) return;
    
    navigator.clipboard.writeText(display.innerText)
        .then(() => alert("Section copied to clipboard!"))
        .catch(err => console.error("Could not copy text: ", err));
}

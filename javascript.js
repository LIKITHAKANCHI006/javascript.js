const KEY = "civicconnect_complaints_v1";

let complaints = JSON.parse(localStorage.getItem(KEY) || "[]");

// Save complaints
function save() {
    localStorage.setItem(KEY, JSON.stringify(complaints));
    refresh();
}

// Switch between website sections
function showTab(id) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.toggle("active", section.id === id);
    });

    document.querySelectorAll("nav button").forEach(button => {
        button.classList.toggle("active", button.dataset.tab === id);
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (id === "admin") {
        renderAdmin();
    }
}

// Navigation buttons
document.querySelectorAll("nav button").forEach(button => {
    button.addEventListener("click", () => {
        showTab(button.dataset.tab);
    });
});

// Generate unique complaint ID
function makeId() {
    return "CC-" +
        new Date().toISOString().slice(0, 10).replaceAll("-", "") +
        "-" + Math.floor(1000 + Math.random() * 9000);
}

// Submit complaint
document.getElementById("complaintForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const complaint = {
        id: makeId(),
        name: document.getElementById("citizen").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        category: document.getElementById("category").value,
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim(),
        date: new Date().toLocaleDateString("en-IN"),
        status: "Pending"
    };

    complaints.unshift(complaint);
    save();

    const notice = document.getElementById("successNotice");

    notice.style.display = "block";
    notice.innerHTML =
        "Complaint submitted successfully. Your reference ID is <strong>" +
        complaint.id +
        "</strong>. Please save this ID to track your complaint.";

    this.reset();

    notice.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

// Track complaint
function trackComplaint() {
    const id = document.getElementById("trackId").value.trim().toUpperCase();

    const complaint = complaints.find(c => c.id === id);
    const result = document.getElementById("trackResult");

    if (!id) {
        result.innerHTML = '<p class="hint">Please enter a reference ID.</p>';
        return;
    }

    if (!complaint) {
        result.innerHTML = `
            <div class="track-card">
                <strong>No complaint found.</strong>
                <p>Check the reference ID and try again.</p>
            </div>`;
        return;
    }

    result.innerHTML = `
        <div class="track-card">
            <h3>
                ${escapeHtml(complaint.category)}
                <span class="status ${complaint.status}">
                    ${complaint.status}
                </span>
            </h3>
            <p><b>Reference:</b> ${escapeHtml(complaint.id)}</p>
            <p><b>Submitted by:</b> ${escapeHtml(complaint.name)}</p>
            <p><b>Location:</b> ${escapeHtml(complaint.location)}</p>
            <p><b>Date:</b> ${escapeHtml(complaint.date)}</p>
            <p><b>Description:</b> ${escapeHtml(complaint.description)}</p>
        </div>`;
}

// Display complaints in admin dashboard
function renderAdmin() {
    const search = document.getElementById("adminSearch").value.toLowerCase();
    const filter = document.getElementById("statusFilter").value;

    const list = complaints.filter(c =>
        (!filter || c.status === filter) &&
        [c.id, c.name, c.location, c.category]
            .some(value => value.toLowerCase().includes(search))
    );

    document.getElementById("adminRows").innerHTML = list.length
        ? list.map(c => `
            <tr>
                <td><b>${escapeHtml(c.id)}</b></td>
                <td>
                    ${escapeHtml(c.name)}<br>
                    <span class="hint">${escapeHtml(c.category)}</span>
                </td>
                <td>${escapeHtml(c.location)}</td>
                <td>${escapeHtml(c.date)}</td>
                <td>
                    <span class="status ${c.status}">
                        ${c.status}
                    </span>
                </td>
                <td>
                    <select aria-label="Update complaint status"
                        onchange="updateStatus('${c.id}', this.value)">
                        ${["Pending", "Processing", "Resolved", "Rejected"]
                            .map(status =>
                                `<option ${c.status === status ? "selected" : ""}>
                                    ${status}
                                </option>`
                            ).join("")}
                    </select>
                </td>
            </tr>
        `).join("")
        : '<tr><td colspan="6" class="empty">No complaints found.</td></tr>';
}

// Update complaint status
function updateStatus(id, status) {
    const complaint = complaints.find(c => c.id === id);

    if (complaint) {
        complaint.status = status;
        save();
        renderAdmin();
    }
}

// Update dashboard statistics
function refresh() {
    document.getElementById("totalCount").textContent = complaints.length;

    document.getElementById("pendingCount").textContent =
        complaints.filter(c => c.status === "Pending").length;

    document.getElementById("processingCount").textContent =
        complaints.filter(c => c.status === "Processing").length;

    document.getElementById("resolvedCount").textContent =
        complaints.filter(c => c.status === "Resolved").length;

    renderAdmin();
}

// Prevent HTML injection
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Load saved complaints when the page opens
refresh();
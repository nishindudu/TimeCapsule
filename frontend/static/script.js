function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("hidden", "success", "error");
    toast.classList.add(isError ? "error" : "success");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 2800);
}

async function saveScore(row) {
    const id = row.dataset.id;
    const programInput = row.querySelector(".programme");
    const scoreInput = row.querySelector(".score");

    const payload = {
        program_name: programInput.value.trim(),
        score: scoreInput.value,
    };

    const response = await fetch(`/api/scores/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            window.location.href = "/admin";
            return;
        }
        showToast(data.message || "Update failed.", true);
        return;
    }

    showToast(data.message || "Saved.");
}

window.addEventListener("DOMContentLoaded", () => {
    const saveButtons = document.querySelectorAll(".save-btn");
    saveButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const row = button.closest("tr");
            await saveScore(row);
        });
    });
});

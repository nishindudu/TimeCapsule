async function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hide');

    setTimeout(() => {
        toast.classList.add('hide');
    }, 3000);
}

async function createTimeCapsule() {
    const content = document.getElementById('text_content').value;
    const openDate = document.getElementById('open_date').value;

    let response = await fetch('/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content,
            open_date: openDate
        })
    });

    if (response.ok) {
        showToast('Time Capsule created successfully!');
        document.getElementById('text_content').value = '';
        document.getElementById('open_date').value = '';
        document.getElementById('time_capsule_id').innerText = (await response.json()).id;
        document.getElementById('response').classList.remove('hide');
    }
    else {
        showToast('Failed to create Time Capsule. :(')
    }
}

async function viewTimeCapsule() {
    const id = document.getElementById('time_capsule_id_input').value;

    let response = await fetch(`/view/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.ok) {
        const data = await response.json();
        showToast('Time Capsule retrieved successfully!');
        document.getElementById('response').classList.remove('hide');
        document.getElementById('time_capsule_content').innerText = data.content;
    }
    else {
        const errorData = await response.json();
        showToast(`${errorData.message}\nOpen Date: ${errorData.open_date}`);
    }
}


async function copyId() {
    const id = document.getElementById('time_capsule_id').innerText;

    try {
        await navigator.clipboard.writeText(id);
        showToast('ID copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy ID. Please copy manually');
    }
}
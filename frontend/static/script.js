async function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hide');

    setTimeout(() => {
        toast.classList.add('hide');
    }, 3000);
}

async function saveIdToLocalStorage(id) {
    try {
        const existing = JSON.parse(localStorage.getItem('time_capsule_ids')) || [];
        existing.push(id);
        // console.log('Saving ID to localStorage:', existing);
        localStorage.setItem('time_capsule_ids', JSON.stringify(existing));
    } catch (err) {
        console.error('Failed to save ID to localStorage:', err);
    }
}

async function createTimeCapsule() {
    const content = document.getElementById('text_content').value;
    const openDate = document.getElementById('open_date').value;
    const maxOpens = document.getElementById('max_opens').value;

    let response = await fetch('/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content,
            open_date: openDate,
            max_opens: maxOpens
        })
    });

    if (response.ok) {
        showToast('Time Capsule created successfully!');
        const id = (await response.json()).id;
        document.getElementById('text_content').value = '';
        document.getElementById('open_date').value = '';
        document.getElementById('time_capsule_id').innerText = id;
        document.getElementById('response').classList.remove('hide');
        await saveIdToLocalStorage(id);
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
        if (errorData.message === 'Time capsule not found!') {
            showToast('Time Capsule not found! Please check the ID and try again.');
            return;
        }
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

async function listSaved() {
    const savedIds = JSON.parse(localStorage.getItem('time_capsule_ids')) || [];
    const list = document.getElementById('saved-capsules');
    list.innerHTML = '';

    if (savedIds.length === 0) {
        list.innerHTML = '<p>No saved time capsules found.</p>';
        return;
    }

    savedIds.forEach(element => {
        const item = document.createElement('li');
        item.style.cursor = 'pointer';
        item.onclick = () => {
            document.getElementById('time_capsule_id_input').value = element;
        };
        item.textContent = element;
        list.appendChild(item);
    });
}

async function toggleSaved() {
    const listContainer = document.getElementById('my-capsules');

    listContainer.style.transform = 'translateX(-10px)';
    listContainer.style.cursor = 'default';
    listSaved();
    return;
}
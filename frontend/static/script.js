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

async function showSizeStats() {
    const text = document.getElementById('text_content').value;
    const stats = document.getElementById('write-stats');

    let size = text.length;
    size = size < 1024 ? `${(size)} bytes` : `${(size / 1024).toFixed(2)} KB`;
    stats.textContent = `This capsule is ~${size}`;
}

async function createTimeCapsule() {
    const content = document.getElementById('text_content').value;
    const openDate = document.getElementById('open_date').value;
    const maxOpens = document.getElementById('max_opens').value;
    const password = document.getElementById('password').value || null;

    let response = await fetch('/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content,
            open_date: openDate,
            max_opens: maxOpens,
            password: password
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

    if (id == "") {
        showToast("Please Enter TimeCapsule ID!");
        return;
    }
    const password = document.getElementById('password').value || null;
    const loader = document.getElementById('loading');
    loader.classList.remove('hide');

    let response = await fetch(`/view/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: password
        })
    })

    if (response.ok) {
        const data = await response.json();
        loader.classList.add('hide');
        showToast('Time Capsule retrieved successfully!');
        document.getElementById('response').classList.remove('hide');
        document.getElementById('time_capsule_content').innerText = data.content;
    }
    else {
        const errorData = await response.json();
        loader.classList.add('hide');
        if (errorData.open_date) {
            showToast(`${errorData.message}\nOpen Date: ${errorData.open_date}`);
        } else {
            showToast(errorData.message);
        }
    }

    loader.classList.add('hide');
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
    const clearBtn = document.getElementById('clear-saved-btn');

    listContainer.style.transform = 'translateX(-10px)';
    listContainer.style.cursor = 'default';
    listSaved();
    clearBtn.classList.remove('hide');
    return;
}

async function clearSaved() {
    localStorage.removeItem('time_capsule_ids');
    listSaved();
}

async function saveCapsule() {
    const data = document.getElementById('time_capsule_content').innerText;

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', 'time_capsule.txt');
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast('Saved Time Capsule content as time_capsule.txt');
}


let sequence = [
    't', 'i', 'm', 'e', 'c', 'a', 'p', 's', 'u', 'l', 'e'
]

let position = 0;

document.addEventListener('keydown', (event) => {
    if (event.key === sequence[position]) {
        position++;

        if (position === sequence.length) {
            position = 0;
            const body = document.body;
            body.classList.add('easter-egg');

            setTimeout(() => {
                body.classList.remove('easter-egg');
            }, 2000);
        }
    }
    else {
        position = 0;
    }
})

window.addEventListener('beforeunload', (event) => {
    const textarea = document.getElementById('text_content');
    if (textarea && textarea.value.trim() !== '') {
        event.preventDefault();
        event.returnValue = '';
    }
});

window.addEventListener('DOMContentLoaded', async () => {
    if (window.location.pathname != "/") {
        return;
    }
    const currentCountEl = document.getElementById('active-capsules-count');
    const stats = await fetch('/stats');
    const data = await stats.json();
    currentCountEl.textContent = `${data.current_count}`;
});
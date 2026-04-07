document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const uploadForm = document.getElementById('upload-form');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const toastContainer = document.getElementById('toast-container');

    // File inputs
    const trackInput = document.getElementById('song');
    const thumbnailInput = document.getElementById('thumbnail');
    
    // Tab Elements
    const navLibraryBtn = document.getElementById('nav-library-btn');
    const navUploadBtn = document.getElementById('nav-upload-btn');
    const libraryPanel = document.getElementById('library-panel');
    const uploadPanel = document.getElementById('upload-panel');

    // Tab Switching Logic
    function switchTab(tab) {
        if (tab === 'library') {
            libraryPanel.classList.remove('hidden');
            uploadPanel.classList.add('hidden');
            navLibraryBtn.classList.replace('border-transparent', 'border-indigo-500');
            navLibraryBtn.classList.replace('text-slate-400', 'text-indigo-400');
            navUploadBtn.classList.replace('border-indigo-500', 'border-transparent');
            navUploadBtn.classList.replace('text-indigo-400', 'text-slate-400');
        } else {
            uploadPanel.classList.remove('hidden');
            libraryPanel.classList.add('hidden');
            navUploadBtn.classList.replace('border-transparent', 'border-indigo-500');
            navUploadBtn.classList.replace('text-slate-400', 'text-indigo-400');
            navLibraryBtn.classList.replace('border-indigo-500', 'border-transparent');
            navLibraryBtn.classList.replace('text-indigo-400', 'text-slate-400');
        }
    }

    navLibraryBtn.addEventListener('click', () => switchTab('library'));
    navUploadBtn.addEventListener('click', () => switchTab('upload'));
    
    // API URL Base (since the frontend runs on the same server, we use relative paths)
    const API_BASE = window.location.origin;

    // --- State ---
    let authToken = localStorage.getItem('adminToken') || null;

    // --- Init ---
    checkAuth();

    // --- Authentication ---
    function checkAuth() {
        if (authToken) {
            loginView.classList.remove('active');
            dashboardView.classList.add('active');
        } else {
            dashboardView.classList.remove('active');
            loginView.classList.add('active');
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        const originalContent = loginBtn.innerHTML;
        loginBtn.innerHTML = '<div class="loader-spinner"></div><span>Authenticating...</span>';
        loginBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            
            showToast('Login successful!', 'success');
            checkAuth();
            
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            loginBtn.innerHTML = originalContent;
            loginBtn.disabled = false;
        }
    });

    logoutBtn.addEventListener('click', () => {
        authToken = null;
        localStorage.removeItem('adminToken');
        uploadForm.reset();
        resetFileCards();
        checkAuth();
        showToast('Logged out securely', 'success');
    });

    // --- Upload Track ---
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!authToken) {
            showToast('Session expired. Please login again.', 'error');
            checkAuth();
            return;
        }
        
        const fileTrack = trackInput.files[0];
        const fileThumb = thumbnailInput.files[0];
        
        if (!fileTrack || !fileThumb) {
            showToast('Please upload both the audio track and thumbnail.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('songName', document.getElementById('songName').value);
        formData.append('singerName', document.getElementById('singerName').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('category', document.getElementById('category').value);
        
        // Match the field names configured in multer! 'song' and 'thumbnail'
        formData.append('song', fileTrack);
        formData.append('thumbnail', fileThumb);

        // Show Loading State
        const originalContent = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<div class="loader-spinner"></div><span>Publishing Track...</span>';
        uploadBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/songs/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                    // Do NOT set Content-Type header when sending FormData! Browser handles it.
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error publishing track');
            }

            showToast(`"${data.songName}" has been successfully published!`, 'success');
            
            // Reset UI
            uploadForm.reset();
            resetFileCards();
            
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            uploadBtn.innerHTML = originalContent;
            uploadBtn.disabled = false;
        }
    });

    // --- File Input UI Handling ---
    function handleFileSelection(inputElem, filenameElem, cardElem, originalText) {
        inputElem.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                filenameElem.textContent = file.name;
                cardElem.classList.add('has-file');
                
                // Change icon to checkmark
                const icon = cardElem.querySelector('.file-icon ion-icon');
                icon.setAttribute('name', 'checkmark-circle');
            } else {
                filenameElem.textContent = originalText;
                cardElem.classList.remove('has-file');
            }
        });
    }

    const trackFilename = document.getElementById('song-filename');
    const thumbFilename = document.getElementById('thumbnail-filename');
    const trackCard = document.getElementById('track-dropzone');
    const thumbCard = document.getElementById('thumbnail-dropzone');
    
    // Store original texts
    const trackOrigText = trackFilename.textContent;
    const thumbOrigText = thumbFilename.textContent;

    handleFileSelection(trackInput, trackFilename, trackCard, trackOrigText);
    handleFileSelection(thumbnailInput, thumbFilename, thumbCard, thumbOrigText);

    function resetFileCards() {
        trackFilename.textContent = trackOrigText;
        thumbFilename.textContent = thumbOrigText;
        trackCard.classList.remove('has-file');
        thumbCard.classList.remove('has-file');
        
        trackCard.querySelector('.file-icon ion-icon').setAttribute('name', 'musical-note');
        thumbCard.querySelector('.file-icon ion-icon').setAttribute('name', 'image');
    }

    // --- Toast Notifications ---
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconName = type === 'success' ? 'checkmark-circle' : 'alert-circle';
        
        toast.innerHTML = `
            <ion-icon name="${iconName}"></ion-icon>
            <div class="toast-content">
                <p>${message}</p>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- Fetch & Render Songs ---
    const songsListBody = document.getElementById('songs-list-body');
    const songsLoading = document.getElementById('songs-loading');
    const songsEmpty = document.getElementById('songs-empty');
    const refreshBtn = document.getElementById('refresh-songs-btn');
    
    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');

    let songsData = [];

    async function loadSongs() {
        if (!authToken) return;
        
        songsListBody.innerHTML = '';
        songsEmpty.classList.add('hidden');
        songsLoading.classList.remove('hidden');
        songsLoading.classList.add('flex');

        try {
            const res = await fetch(`${API_BASE}/songs?limit=50`);
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to fetch songs');
            
            songsData = data.songs || [];
            renderSongs(songsData);
        } catch (error) {
            showToast(error.message, 'error');
            songsLoading.classList.remove('flex');
            songsLoading.classList.add('hidden');
        }
    }

    function renderSongs(songs) {
        songsLoading.classList.remove('flex');
        songsLoading.classList.add('hidden');
        
        if (songs.length === 0) {
            songsEmpty.classList.remove('hidden');
            songsEmpty.classList.add('flex');
            return;
        }

        songsListBody.innerHTML = songs.map(song => {
            // Reformat filename to just be the name or full url
            const thumbUrl = song.thumbnailUrl.replace(/\\/g, '/');
            const cleanThumb = thumbUrl.startsWith('uploads') ? `/${thumbUrl}` : thumbUrl;
            
            // Extract filename from the path to use stream API
            const audioFilename = song.songUrl.split(/[\\/]/).pop();
            const audioUrl = `${API_BASE}/songs/stream/${audioFilename}`;
            
            return `
            <tr class="hover:bg-white/5 transition-colors border-b border-white/5 group">
                <td class="py-3 px-4">
                    <div class="w-10 h-10 rounded bg-slate-800 overflow-hidden flex items-center justify-center">
                        <img src="${cleanThumb}" alt="Cover" class="w-full h-full object-cover" onerror="this.outerHTML='<ion-icon name=\\'musical-notes\\' class=\\'text-slate-500\\'></ion-icon>'">
                    </div>
                </td>
                <td class="py-3 px-4">
                    <div class="font-medium truncate max-w-[200px] text-slate-200">${song.songName}</div>
                    <div class="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">${song.singerName}</div>
                </td>
                <td class="py-3 px-4 text-slate-400 capitalize">${song.category}</td>
                <td class="py-3 px-4">
                    <audio controls class="h-8 max-w-[180px] rounded" src="${audioUrl}"></audio>
                </td>
                <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                        <button class="p-1.5 rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition edit-song-btn" data-id="${song._id}" title="Edit">
                            <ion-icon name="pencil"></ion-icon>
                        </button>
                        <button class="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition delete-song-btn" data-id="${song._id}" title="Delete">
                            <ion-icon name="trash"></ion-icon>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');

        // Attach event listeners to new buttons
        document.querySelectorAll('.edit-song-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.id));
        });
        
        document.querySelectorAll('.delete-song-btn').forEach(btn => {
            btn.addEventListener('click', (e) => deleteSong(e.currentTarget.dataset.id));
        });
    }

    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('ion-icon');
        icon.classList.add('animate-spin');
        loadSongs().then(() => {
            setTimeout(() => icon.classList.remove('animate-spin'), 500);
        });
    });

    // --- Delete Song ---
    async function deleteSong(id) {
        if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) return;
        
        try {
            const res = await fetch(`${API_BASE}/songs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete song');
            }
            
            showToast('Track deleted successfully', 'success');
            loadSongs(); // Refresh list
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    // --- Edit Song ---
    function openEditModal(id) {
        const song = songsData.find(s => s._id === id);
        if (!song) return;
        
        // Populate form
        document.getElementById('edit-songId').value = song._id;
        document.getElementById('edit-songName').value = song.songName;
        document.getElementById('edit-singerName').value = song.singerName;
        document.getElementById('edit-description').value = song.description || '';
        document.getElementById('edit-category').value = song.category;
        
        // Show modal
        editModal.classList.remove('hidden');
    }

    function closeEditModal() {
        editModal.classList.add('hidden');
        editForm.reset();
    }

    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-songId').value;
        const songName = document.getElementById('edit-songName').value;
        const singerName = document.getElementById('edit-singerName').value;
        const description = document.getElementById('edit-description').value;
        const category = document.getElementById('edit-category').value;
        
        const originalContent = saveEditBtn.innerHTML;
        saveEditBtn.innerHTML = '<div class="loader-spinner"></div>';
        saveEditBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/songs/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ songName, singerName, description, category })
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to update song');
            }
            
            showToast('Track updated successfully', 'success');
            closeEditModal();
            loadSongs(); // Refresh list
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            saveEditBtn.innerHTML = originalContent;
            saveEditBtn.disabled = false;
        }
    });

    // Make sure we load the initial songs when we successfully auth
    const originalCheckAuth = checkAuth;
    checkAuth = function() {
        originalCheckAuth();
        if (authToken) {
            loadSongs();
        }
    };
    checkAuth();

});

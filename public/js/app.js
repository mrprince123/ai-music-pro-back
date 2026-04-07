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
});

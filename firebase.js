
// Save data to Firebase
async function saveData() {
    try {
        const userId = firebase.auth().currentUser.uid;
        await db.collection('users').doc(userId).set({
            clients: appState.clients,
            darkMode: appState.darkMode,
            currentPage: appState.currentPage,
            lastUpdated: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error saving data:', err);
    }
}

// Load data from Firebase
async function loadData() {
    try {
        const userId = firebase.auth().currentUser.uid;
        const doc = await db.collection('users').doc(userId).get();
        
        if (doc.exists) {
            const data = doc.data();
            if (data.clients && Array.isArray(data.clients)) {
                appState.clients = data.clients;
            }
            if (data.darkMode !== undefined) {
                appState.darkMode = data.darkMode;
            }
            if (data.currentPage) {
                appState.currentPage = data.currentPage;
            }
        }
    } catch (err) {
        console.error('Error loading data:', err);
    }
};

// Initialize Firebase firebase.initializeApp(firebaseConfig); const db = firebase.firestore();


// Handle login
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    showLoading();

    try {
        // Sign in with Firebase
        await firebase.auth().signInWithEmailAndPassword(username, password);
        handleSuccessfulLogin();
    } catch (error) {
        handleFailedLogin();
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        hideLoading();
    }
});

async function logout() {
    try {
        await firebase.auth().signOut();
        window.location.replace('./index.html');
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
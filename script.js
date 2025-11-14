// ========================================
// SUPABASE INITIALIZATION
// ========================================

// Supabase config – replace with your real values
const SUPABASE_URL = 'https://znrbanstgnolsatpednp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucmJhbnN0Z25vbHNhdHBlZG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDgxOTksImV4cCI6MjA3ODYyNDE5OX0.yT0SSbqcZFzwpYCsvDNWNp36BY6RuQnbhCGMB9ZTfsM';

// Initialize Supabase client
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// DOM ELEMENTS
// ========================================

// Wait for the page to fully load before running the script
document.addEventListener('DOMContentLoaded', function() {

    // Auth UI elements
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    const signUpForm = document.getElementById('signUpForm');
    const loginForm = document.getElementById('loginForm');
    const showLoginLink = document.getElementById('showLogin');
    const showSignUpLink = document.getElementById('showSignUp');
    const logoutButton = document.getElementById('logoutButton');
    const userEmailDisplay = document.getElementById('userEmail');

    // Sign up form elements
    const signUpEmail = document.getElementById('signUpEmail');
    const signUpPassword = document.getElementById('signUpPassword');
    const signUpPasswordConfirm = document.getElementById('signUpPasswordConfirm');
    const signUpButton = document.getElementById('signUpButton');
    const signUpError = document.getElementById('signUpError');

    // Login form elements
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginButton = document.getElementById('loginButton');
    const loginError = document.getElementById('loginError');

    // App UI elements
    const gratitudeInput = document.getElementById('gratitudeInput');
    const saveButton = document.getElementById('saveButton');
    const notesList = document.getElementById('notesList');

    // ========================================
    // INITIALIZATION
    // ========================================

    // Check for existing session when page loads
    checkSession();

    // Listen for auth state changes (login/logout)
    db.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            showApp(session.user);
        } else if (event === 'SIGNED_OUT') {
            showAuth();
        }
    });

    // ========================================
    // AUTH FORM TOGGLE
    // ========================================

    // Switch to login form
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        signUpForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        clearErrors();
    });

    // Switch to sign up form
    showSignUpLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('hidden');
        signUpForm.classList.remove('hidden');
        clearErrors();
    });

    // ========================================
    // SIGN UP
    // ========================================

    signUpForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous errors
        clearError(signUpError);

        // Get form values
        const email = signUpEmail.value.trim();
        const password = signUpPassword.value;
        const passwordConfirm = signUpPasswordConfirm.value;

        // Validate inputs
        if (!email || !password || !passwordConfirm) {
            showError(signUpError, 'Please fill in all fields');
            return;
        }

        // Validate email format
        if (!isValidEmail(email)) {
            showError(signUpError, 'Please enter a valid email address');
            return;
        }

        // Validate password length
        if (password.length < 8) {
            showError(signUpError, 'Password must be at least 8 characters');
            return;
        }

        // Check if passwords match
        if (password !== passwordConfirm) {
            showError(signUpError, 'Passwords do not match');
            return;
        }

        // Disable button and show loading state
        setButtonLoading(signUpButton, true, 'Signing up...');

        try {
            // Attempt to sign up with Supabase
            const { error } = await db.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                showError(signUpError, error.message);
            } else {
                // Success - show login form with success message
                signUpForm.reset();
                signUpForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                showError(loginError, 'Account created! Please check your email to confirm your account, then log in.', 'success');
            }
        } catch (error) {
            showError(signUpError, 'An unexpected error occurred. Please try again.');
            console.error('Sign up error:', error);
        } finally {
            // Re-enable button
            setButtonLoading(signUpButton, false, 'Sign Up');
        }
    });

    // ========================================
    // LOGIN
    // ========================================

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous errors
        clearError(loginError);

        // Get form values
        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        // Validate inputs
        if (!email || !password) {
            showError(loginError, 'Please enter your email and password');
            return;
        }

        // Disable button and show loading state
        setButtonLoading(loginButton, true, 'Logging in...');

        try {
            // Attempt to sign in with Supabase
            const { error } = await db.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                showError(loginError, 'Invalid email or password');
            } else {
                // Success - the onAuthStateChange listener will handle showing the app
                loginForm.reset();
            }
        } catch (error) {
            showError(loginError, 'An unexpected error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            // Re-enable button
            setButtonLoading(loginButton, false, 'Log In');
        }
    });

    // ========================================
    // LOGOUT
    // ========================================

    logoutButton.addEventListener('click', async function() {
        try {
            await db.auth.signOut();
            // The onAuthStateChange listener will handle showing the auth UI
        } catch (error) {
            alert('Error logging out. Please try again.');
            console.error('Logout error:', error);
        }
    });

    // ========================================
    // SESSION MANAGEMENT
    // ========================================

    // Check if user has an existing session
    async function checkSession() {
        try {
            const { data: { session } } = await db.auth.getSession();

            if (session) {
                // User is logged in
                showApp(session.user);
            } else {
                // User is not logged in
                showAuth();
            }
        } catch (error) {
            console.error('Error checking session:', error);
            showAuth();
        }
    }

    // Show the app UI (user is logged in)
    function showApp(user) {
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        userEmailDisplay.textContent = user.email;

        // Load user's notes from database
        displayNotes();
    }

    // Show the auth UI (user is logged out)
    function showAuth() {
        appContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');

        // Clear notes list
        notesList.innerHTML = '';

        // Clear input
        gratitudeInput.value = '';
    }

    // ========================================
    // NOTES - SAVE
    // ========================================

    // Add click event listener to the save button
    saveButton.addEventListener('click', saveNote);

    // Also allow saving by pressing Enter (Ctrl+Enter or Cmd+Enter)
    gratitudeInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            saveNote();
        }
    });

    // Function to save a new note to Supabase
    async function saveNote() {
        // Get the text from the input field and remove extra whitespace
        const noteText = gratitudeInput.value.trim();

        // Check if the input is not empty
        if (noteText === '') {
            alert('Please write something before saving!');
            return;
        }

        // Disable button and show loading state
        setButtonLoading(saveButton, true, 'Saving...');

        try {
            // Get current user
            const { data: { user } } = await db.auth.getUser();

            if (!user) {
                alert('You must be logged in to save notes');
                return;
            }

            // Insert note into Supabase database
            const { error } = await db
                .from('gratitude_notes')
                .insert({
                    user_id: user.id,
                    text: noteText
                })
                .select();

            if (error) {
                throw error;
            }

            // Clear the input field
            gratitudeInput.value = '';

            // Refresh the display to show the new note
            await displayNotes();

        } catch (error) {
            alert('Error saving note. Please try again.');
            console.error('Save note error:', error);
        } finally {
            // Re-enable button
            setButtonLoading(saveButton, false, 'Save');
        }
    }

    // ========================================
    // NOTES - LOAD & DISPLAY
    // ========================================

    // Function to load notes from Supabase and display them
    async function displayNotes() {
        try {
            // Get current user
            const { data: { user } } = await db.auth.getUser();

            if (!user) {
                notesList.innerHTML = '<p class="empty-message">Please log in to see your notes.</p>';
                return;
            }

            // Fetch notes from Supabase, ordered by newest first
            const { data: notes, error } = await db
                .from('gratitude_notes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Clear the current display
            notesList.innerHTML = '';

            // Check if there are any notes
            if (!notes || notes.length === 0) {
                notesList.innerHTML = '<p class="empty-message">No gratitude notes yet. Start writing!</p>';
                return;
            }

            // Loop through each note and create HTML for it
            notes.forEach(function(note) {
                // Create a div element for the note
                const noteDiv = document.createElement('div');
                noteDiv.className = 'note';

                // Format the date
                const dateStr = new Date(note.created_at).toLocaleString();

                // Set the HTML content for the note
                noteDiv.innerHTML = `
                    <p class="note-text">${escapeHtml(note.text)}</p>
                    <p class="note-date">${dateStr}</p>
                    <button class="delete-btn" data-id="${note.id}">Delete</button>
                `;

                // Add click event listener to the delete button
                const deleteButton = noteDiv.querySelector('.delete-btn');
                deleteButton.addEventListener('click', function() {
                    deleteNote(note.id);
                });

                // Add the note to the notes list
                notesList.appendChild(noteDiv);
            });

        } catch (error) {
            notesList.innerHTML = '<p class="empty-message">Error loading notes. Please refresh the page.</p>';
            console.error('Display notes error:', error);
        }
    }

    // ========================================
    // NOTES - DELETE
    // ========================================

    // Function to delete a note from Supabase
    async function deleteNote(noteId) {
        // Show confirmation dialog to prevent accidental deletion
        const confirmDelete = window.confirm('Are you sure you want to delete this gratitude note?');

        // If user clicked Cancel, exit the function without deleting
        if (!confirmDelete) {
            return;
        }

        try {
            // Delete note from Supabase database
            const { error } = await db
                .from('gratitude_notes')
                .delete()
                .eq('id', noteId);

            if (error) {
                throw error;
            }

            // Refresh the display to show the updated list
            await displayNotes();

        } catch (error) {
            alert('Error deleting note. Please try again.');
            console.error('Delete note error:', error);
        }
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    // Function to escape HTML characters to prevent XSS attacks
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to show error message
    function showError(errorElement, message, type = 'error') {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');

        // For success messages, change the styling
        if (type === 'success') {
            errorElement.style.backgroundColor = '#d1fae5';
            errorElement.style.color = '#065f46';
            errorElement.style.borderLeftColor = '#10b981';
        } else {
            errorElement.style.backgroundColor = '#fee2e2';
            errorElement.style.color = '#dc2626';
            errorElement.style.borderLeftColor = '#dc2626';
        }
    }

    // Function to clear error message
    function clearError(errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }

    // Function to clear all error messages
    function clearErrors() {
        clearError(signUpError);
        clearError(loginError);
    }

    // Function to set button loading state
    function setButtonLoading(button, isLoading, text) {
        if (isLoading) {
            button.disabled = true;
            button.textContent = text;
        } else {
            button.disabled = false;
            button.textContent = text;
        }
    }

});

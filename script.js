  // Wait for the page to fully load before running the script
  document.addEventListener('DOMContentLoaded', function() {

      // Get references to the HTML elements we need
      const gratitudeInput = document.getElementById('gratitudeInput');
      const saveButton = document.getElementById('saveButton');
      const notesList = document.getElementById('notesList');

      // Load and display notes when the page loads
      displayNotes();

      // Add click event listener to the save button
      saveButton.addEventListener('click', saveNote);

      // Also allow saving by pressing Enter (Ctrl+Enter or Cmd+Enter)
      gratitudeInput.addEventListener('keydown', function(event) {
          if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              saveNote();
          }
      });

      // Function to save a new note
      function saveNote() {
          // Get the text from the input field and remove extra whitespace
          const noteText = gratitudeInput.value.trim();

          // Check if the input is not empty
          if (noteText === '') {
              alert('Please write something before saving!');
              return;
          }

          // Create a note object with text and timestamp
          const note = {
              text: noteText,
              date: new Date().toLocaleString() // Current date and time
          };

          // Get existing notes from localStorage (or empty array if none exist)
          const notes = getNotesFromStorage();

          // Add the new note to the beginning of the array
          notes.unshift(note);

          // Save the updated notes array back to localStorage
          saveNotesToStorage(notes);

          // Clear the input field
          gratitudeInput.value = '';

          // Refresh the display to show the new note
          displayNotes();
      }

      // Function to get notes from localStorage
      function getNotesFromStorage() {
          // Get the notes from localStorage
          const notesJSON = localStorage.getItem('gratitudeNotes');

          // If notes exist, parse and return them; otherwise return empty array
          return notesJSON ? JSON.parse(notesJSON) : [];
      }

      // Function to save notes to localStorage
      function saveNotesToStorage(notes) {
          // Convert the notes array to JSON string and save to localStorage
          localStorage.setItem('gratitudeNotes', JSON.stringify(notes));
      }

      // Function to display all notes on the page
      function displayNotes() {
          // Get all notes from storage
          const notes = getNotesFromStorage();

          // Clear the current display
          notesList.innerHTML = '';

          // Check if there are any notes
          if (notes.length === 0) {
              // Show a message if no notes exist
              notesList.innerHTML = '<p class="empty-message">No gratitude notes yet. Start writing!</p>';
              return;
          }

          // Loop through each note and create HTML for it
          notes.forEach(function(note, index) {
              // Create a div element for the note
              const noteDiv = document.createElement('div');
              noteDiv.className = 'note';

              // Set the HTML content for the note
              noteDiv.innerHTML = `
                  <p class="note-text">${escapeHtml(note.text)}</p>
                  <p class="note-date">${note.date}</p>
                  <button class="delete-btn" data-index="${index}">Delete</button>
              `;

              // Add click event listener to the delete button
              const deleteButton = noteDiv.querySelector('.delete-btn');
              deleteButton.addEventListener('click', function() {
                  deleteNote(index);
              });

              // Add the note to the notes list
              notesList.appendChild(noteDiv);
          });
      }

      // Function to delete a note at a specific index
      function deleteNote(index) {
          // Get existing notes from storage
          const notes = getNotesFromStorage();

          // Remove the note at the specified index
          notes.splice(index, 1);

          // Save the updated notes array back to localStorage
          saveNotesToStorage(notes);

          // Refresh the display to show the updated list
          displayNotes();
      }

      // Function to escape HTML characters to prevent XSS attacks
      function escapeHtml(text) {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
      }

  });

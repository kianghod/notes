// Project Notes Application
class ProjectNotes {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('projectNotes')) || [];
        this.currentNoteId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderNotes();
        this.showEmptyStateIfNeeded();
    }

    bindEvents() {
        // Add note button
        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submission
        document.getElementById('noteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNote();
        });

        // Close modal on outside click
        document.getElementById('noteModal').addEventListener('click', (e) => {
            if (e.target.id === 'noteModal') {
                this.closeModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal(noteId = null) {
        const modal = document.getElementById('noteModal');
        const form = document.getElementById('noteForm');
        const title = document.querySelector('.modal-header h2');

        this.currentNoteId = noteId;

        if (noteId) {
            // Edit mode
            const note = this.notes.find(n => n.id === noteId);
            if (note) {
                title.textContent = 'Edit Note';
                document.getElementById('noteTitle').value = note.title;
                document.getElementById('noteContent').value = note.content;
                document.querySelector(`input[name="color"][value="${note.color}"]`).checked = true;
            }
        } else {
            // Create mode
            title.textContent = 'Create New Note';
            form.reset();
        }

        modal.classList.add('show');
        document.getElementById('noteTitle').focus();
    }

    closeModal() {
        const modal = document.getElementById('noteModal');
        modal.classList.remove('show');
        this.currentNoteId = null;
    }

    saveNote() {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const color = document.querySelector('input[name="color"]:checked').value;

        if (!title || !content) {
            alert('Please fill in both title and content.');
            return;
        }

        if (this.currentNoteId) {
            // Update existing note
            const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
            if (noteIndex !== -1) {
                this.notes[noteIndex] = {
                    ...this.notes[noteIndex],
                    title,
                    content,
                    color,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new note
            const newNote = {
                id: this.generateId(),
                title,
                content,
                color,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.notes.unshift(newNote);
        }

        this.saveToLocalStorage();
        this.renderNotes();
        this.closeModal();
        this.showEmptyStateIfNeeded();
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveToLocalStorage();
            this.renderNotes();
            this.showEmptyStateIfNeeded();
        }
    }

    editNote(noteId) {
        this.openModal(noteId);
    }

    renderNotes() {
        const notesGrid = document.getElementById('notesGrid');
        
        if (this.notes.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note"></i>
                    <h3>No notes yet</h3>
                    <p>Create your first project note to get started!</p>
                </div>
            `;
            return;
        }

        notesGrid.innerHTML = this.notes.map(note => this.createNoteHTML(note)).join('');
    }

    createNoteHTML(note) {
        const colorClass = this.getColorClass(note.color);
        const date = new Date(note.updatedAt || note.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        return `
            <div class="note ${colorClass}" data-id="${note.id}">
                <div class="note-header">
                    <h3 class="note-title">${this.escapeHtml(note.title)}</h3>
                    <div class="note-actions">
                        <button class="action-btn edit-btn" onclick="app.editNote('${note.id}')" title="Edit note">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="app.deleteNote('${note.id}')" title="Delete note">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">
                    ${this.escapeHtml(note.content).replace(/\n/g, '<br>')}
                </div>
                <div class="note-footer">
                    <i class="fas fa-clock"></i>
                    ${formattedDate}
                </div>
            </div>
        `;
    }

    getColorClass(color) {
        const colorMap = {
            '#fff9c4': 'yellow',
            '#f8bbd9': 'pink',
            '#c8e6c9': 'green',
            '#bbdefb': 'blue',
            '#ffe0b2': 'orange'
        };
        return colorMap[color] || 'yellow';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    saveToLocalStorage() {
        localStorage.setItem('projectNotes', JSON.stringify(this.notes));
    }

    showEmptyStateIfNeeded() {
        const notesGrid = document.getElementById('notesGrid');
        const emptyState = notesGrid.querySelector('.empty-state');
        
        if (this.notes.length === 0 && !emptyState) {
            notesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-sticky-note"></i>
                    <h3>No notes yet</h3>
                    <p>Create your first project note to get started!</p>
                </div>
            `;
        }
    }

    // Search functionality (bonus feature)
    searchNotes(query) {
        if (!query.trim()) {
            this.renderNotes();
            return;
        }

        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );

        const notesGrid = document.getElementById('notesGrid');
        
        if (filteredNotes.length === 0) {
            notesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No results found</h3>
                    <p>Try searching with different keywords.</p>
                </div>
            `;
        } else {
            notesGrid.innerHTML = filteredNotes.map(note => this.createNoteHTML(note)).join('');
        }
    }
}

// Initialize the application
const app = new ProjectNotes();

// Add some sample notes for demonstration
if (app.notes.length === 0) {
    const sampleNotes = [
        {
            id: 'sample1',
            title: 'Welcome to Project Notes!',
            content: 'This is your first note. Click the "+" button to create more notes. You can edit or delete notes by hovering over them.',
            color: '#fff9c4',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'sample2',
            title: 'Project Ideas',
            content: '• Build a mobile app\n• Learn a new framework\n• Create a portfolio website\n• Start a blog',
            color: '#c8e6c9',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'sample3',
            title: 'Meeting Notes',
            content: 'Team standup tomorrow at 10 AM. Discuss progress on the new feature and plan for the upcoming sprint.',
            color: '#bbdefb',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
        }
    ];

    app.notes = sampleNotes;
    app.saveToLocalStorage();
    app.renderNotes();
} 
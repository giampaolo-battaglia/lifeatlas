/**
 * Life Atlas - Memory Mapping Application
 * A personal digital memory map for organizing life experiences
 */

class LifeAtlas {
    constructor() {
        this.map = null;
        this.memories = JSON.parse(localStorage.getItem('lifeAtlasMemories')) || [];
        this.pins = new Map();
        this.currentPin = null;
        this.addingMemory = false;
        this.currentMemoryId = null;
        this.editingMemory = false;
        this.version = '1.0.0';
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.initMap();
        this.loadMemories();
        this.setupEventListeners();
        this.setDefaultDate();
        this.showWelcomeMessage();
    }

    /**
     * Initialize the Leaflet map
     */
    initMap() {
        // Default to New York City, but will be overridden by user location if available
        this.map = L.map('map').setView([40.7128, -74.0060], 10);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add map click handler
        this.map.on('click', (e) => {
            if (this.addingMemory) {
                this.createMemoryAt(e.latlng);
            }
        });

        // Try to get user's location
        this.getUserLocation();
    }

    /**
     * Get user's current location and center map
     */
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.map.setView([latitude, longitude], 13);
                },
                (error) => {
                    console.log('Location access denied or unavailable:', error);
                    // Keep default location
                }
            );
        }
    }

    /**
     * Set default date to today
     */
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('memoryDate').value = today;
    }

    /**
     * Show welcome message for first-time users
     */
    showWelcomeMessage() {
        if (this.memories.length === 0 && !localStorage.getItem('lifeAtlasWelcomeShown')) {
            setTimeout(() => {
                alert('Welcome to Life Atlas! 🧭\n\nClick the 📍 button and then click anywhere on the map to create your first memory pin. Each pin represents a moment, thought, or experience tied to a place.');
                localStorage.setItem('lifeAtlasWelcomeShown', 'true');
            }, 1000);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Memory form submission
        document.getElementById('memoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMemory();
        });

        // Mood selector
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // Modal close on outside click
        document.getElementById('memoryModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('memoryModal')) {
                this.closeModal();
            }
        });

        document.getElementById('detailModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('detailModal')) {
                this.closeDetailModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('memoryModal').style.display === 'block') {
                    this.closeModal();
                }
                if (document.getElementById('detailModal').style.display === 'block') {
                    this.closeDetailModal();
                }
                if (this.addingMemory) {
                    this.addMemoryMode();
                }
            }
        });
    }

    /**
     * Create a memory at the specified location
     */
    createMemoryAt(latlng) {
        this.currentPin = { lat: latlng.lat, lng: latlng.lng };
        this.showModal();
        this.addingMemory = false;
        this.updateFloatingActionButton();
        
        // Add ripple effect
        this.createRipple(latlng);
    }

    /**
     * Create a visual ripple effect at the clicked location
     */
    createRipple(latlng) {
        const point = this.map.latLngToContainerPoint(latlng);
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        ripple.style.left = (point.x - 10) + 'px';
        ripple.style.top = (point.y - 10) + 'px';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        
        document.getElementById('map').appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Show the memory creation modal
     */
    showModal() {
        document.getElementById('memoryModal').style.display = 'block';
        document.getElementById('memoryTitle').focus();
    }

    /**
     * Close the memory creation modal
     */
    closeModal() {
        document.getElementById('memoryModal').style.display = 'none';
        this.currentPin = null;
        this.editingMemory = false;
        this.currentMemoryId = null;
        this.resetForm();
    }

    /**
     * Reset the memory form
     */
    resetForm() {
        document.getElementById('memoryForm').reset();
        document.querySelectorAll('.mood-option').forEach(o => o.classList.remove('selected'));
        this.setDefaultDate();
    }

    /**
     * Save a memory to storage and add to map
     */
    saveMemory() {
        const title = document.getElementById('memoryTitle').value.trim();
        const date = document.getElementById('memoryDate').value;
        const description = document.getElementById('memoryDescription').value.trim();
        const selectedMood = document.querySelector('.mood-option.selected');
        const mood = selectedMood ? selectedMood.dataset.mood : '📍';

        // Validation
        if (!title || !date || !description) {
            alert('Please fill in all required fields.');
            return;
        }

        const memory = {
            id: this.editingMemory ? this.currentMemoryId : Date.now(),
            title,
            date,
            description,
            mood,
            lat: this.currentPin.lat,
            lng: this.currentPin.lng,
            createdAt: this.editingMemory ? 
                this.memories.find(m => m.id === this.currentMemoryId).createdAt : 
                new Date().toISOString()
        };

        if (this.editingMemory) {
            const index = this.memories.findIndex(m => m.id === this.currentMemoryId);
            this.memories[index] = memory;
            this.pins.get(this.currentMemoryId).remove();
        } else {
            this.memories.push(memory);
        }

        this.saveToStorage();
        this.addPinToMap(memory);
        this.closeModal();

        // Show success message
        this.showToast('Memory saved successfully! 🎉');
    }

    /**
     * Add a pin to the map for the given memory
     */
    addPinToMap(memory) {
        const pinElement = document.createElement('div');
        pinElement.className = 'memory-pin';
        pinElement.setAttribute('data-mood', memory.mood);

        const icon = L.divIcon({
            html: pinElement.outerHTML,
            className: '',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });

        const marker = L.marker([memory.lat, memory.lng], { icon }).addTo(this.map);
        
        const popupContent = this.createPopupContent(memory);
        marker.bindPopup(popupContent, {
            className: 'custom-popup',
            maxWidth: 300
        });

        this.pins.set(memory.id, marker);
    }

    /**
     * Create popup content for a memory pin
     */
    createPopupContent(memory) {
        const excerpt = memory.description.substring(0, 100) + (memory.description.length > 100 ? '...' : '');
        
        return `
            <div class="popup-content">
                <div class="popup-title">${this.escapeHtml(memory.title)}</div>
                <div class="popup-mood">${memory.mood}</div>
                <div class="popup-excerpt">${this.escapeHtml(excerpt)}</div>
                <button class="popup-btn" onclick="lifeAtlas.showMemoryDetail(${memory.id})">Open Memory</button>
            </div>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show detailed view of a memory
     */
    showMemoryDetail(memoryId) {
        const memory = this.memories.find(m => m.id === memoryId);
        if (!memory) return;

        const content = `
            <div class="memory-detail">
                <h3>${this.escapeHtml(memory.title)}</h3>
                <div class="memory-meta">
                    <span>📅 ${new Date(memory.date).toLocaleDateString()}</span>
                    <span>${memory.mood}</span>
                    <span>🕒 ${new Date(memory.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="memory-description">${this.escapeHtml(memory.description)}</div>
            </div>
        `;

        document.getElementById('memoryDetailContent').innerHTML = content;
        document.getElementById('detailModal').style.display = 'block';
        this.currentMemoryId = memoryId;
    }

    /**
     * Close the memory detail modal
     */
    closeDetailModal() {
        document.getElementById('detailModal').style.display = 'none';
        this.currentMemoryId = null;
    }

    /**
     * Edit an existing memory
     */
    editMemory() {
        const memory = this.memories.find(m => m.id === this.currentMemoryId);
        if (!memory) return;

        this.currentPin = { lat: memory.lat, lng: memory.lng };
        this.editingMemory = true;

        // Populate form with existing data
        document.getElementById('memoryTitle').value = memory.title;
        document.getElementById('memoryDate').value = memory.date;
        document.getElementById('memoryDescription').value = memory.description;
        
        // Select the mood
        document.querySelectorAll('.mood-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.mood === memory.mood) {
                option.classList.add('selected');
            }
        });

        this.closeDetailModal();
        this.showModal();
    }

    /**
     * Delete a memory
     */
    deleteMemory() {
        if (confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
            const index = this.memories.findIndex(m => m.id === this.currentMemoryId);
            if (index !== -1) {
                this.pins.get(this.currentMemoryId).remove();
                this.pins.delete(this.currentMemoryId);
                this.memories.splice(index, 1);
                this.saveToStorage();
                this.closeDetailModal();
                this.showToast('Memory deleted successfully.');
            }
        }
    }

    /**
     * Load all memories from storage and add to map
     */
    loadMemories() {
        this.memories.forEach(memory => {
            this.addPinToMap(memory);
        });
    }

    /**
     * Save memories to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('lifeAtlasMemories', JSON.stringify(this.memories));
        } catch (error) {
            console.error('Failed to save memories:', error);
            this.showToast('Failed to save memory. Storage may be full.', 'error');
        }
    }

    /**
     * Toggle the filters panel
     */
    toggleFilters() {
        const filters = document.getElementById('filters');
        filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
    }

    /**
     * Apply filters to memories
     */
    applyFilters() {
        const moodFilter = document.getElementById('moodFilter').value;
        const dateFrom = document.getElementById('dateFromFilter').value;
        const dateTo = document.getElementById('dateToFilter').value;

        let filteredCount = 0;

        this.pins.forEach((marker, id) => {
            const memory = this.memories.find(m => m.id === id);
            let show = true;

            if (moodFilter && memory.mood !== moodFilter) {
                show = false;
            }

            if (dateFrom && memory.date < dateFrom) {
                show = false;
            }

            if (dateTo && memory.date > dateTo) {
                show = false;
            }

            if (show) {
                marker.addTo(this.map);
                filteredCount++;
            } else {
                this.map.removeLayer(marker);
            }
        });

        this.showToast(`Showing ${filteredCount} of ${this.memories.length} memories`);
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        document.getElementById('moodFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        
        this.pins.forEach((marker) => {
            marker.addTo(this.map);
        });

        this.showToast('All filters cleared');
    }

    /**
     * Jump to a random memory
     */
    randomMemory() {
        if (this.memories.length === 0) {
            this.showToast('No memories to explore yet! Start by adding your first memory.', 'info');
            return;
        }

        const randomMemory = this.memories[Math.floor(Math.random() * this.memories.length)];
        this.map.setView([randomMemory.lat, randomMemory.lng], 15);
        
        setTimeout(() => {
            this.pins.get(randomMemory.id).openPopup();
        }, 500);

        this.showToast(`Jumped to: ${randomMemory.title} 🎲`);
    }

    /**
     * Toggle memory adding mode
     */
    addMemoryMode() {
        this.addingMemory = !this.addingMemory;
        this.updateFloatingActionButton();
        
        if (this.addingMemory) {
            this.showToast('Click anywhere on the map to place a memory pin! 📍');
        }
    }

    /**
     * Update the floating action button appearance
     */
    updateFloatingActionButton() {
        const btn = document.querySelector('.floating-action');
        
        if (this.addingMemory) {
            btn.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
            btn.innerHTML = '❌';
            btn.title = 'Cancel adding memory';
        } else {
            btn.style.background = 'linear-gradient(135deg, var(--sunset-orange), var(--forest-green))';
            btn.innerHTML = '📍';
            btn.title = 'Add memory';
        }
    }

    /**
     * Show a toast notification
     */
    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : type === 'info' ? '#17a2b8' : 'var(--forest-green)'};
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            box-shadow: 0 4px 15px var(--shadow);
            z-index: 3000;
            font-family: 'Kalam', cursive;
            font-weight: 700;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Slide out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Export memories as JSON
     */
    exportMemories() {
        const dataStr = JSON.stringify(this.memories, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `life-atlas-memories-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Memories exported successfully! 📁');
    }

    /**
     * Import memories from JSON file
     */
    importMemories(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedMemories = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedMemories)) {
                    throw new Error('Invalid file format');
                }

                // Clear existing pins
                this.pins.forEach(marker => marker.remove());
                this.pins.clear();

                // Load imported memories
                this.memories = importedMemories;
                this.saveToStorage();
                this.loadMemories();

                this.showToast(`Successfully imported ${importedMemories.length} memories! 🎉`);
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Failed to import memories. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Get statistics about memories
     */
    getStats() {
        const stats = {
            total: this.memories.length,
            moods: {},
            oldestDate: null,
            newestDate: null,
            averageDescriptionLength: 0
        };

        if (this.memories.length === 0) {
            return stats;
        }

        let totalLength = 0;
        let dates = [];

        this.memories.forEach(memory => {
            // Count moods
            stats.moods[memory.mood] = (stats.moods[memory.mood] || 0) + 1;
            
            // Track dates
            dates.push(new Date(memory.date));
            
            // Sum description lengths
            totalLength += memory.description.length;
        });

        dates.sort();
        stats.oldestDate = dates[0];
        stats.newestDate = dates[dates.length - 1];
        stats.averageDescriptionLength = Math.round(totalLength / this.memories.length);

        return stats;
    }
}

// Global functions for HTML onclick handlers
function toggleFilters() {
    lifeAtlas.toggleFilters();
}

function randomMemory() {
    lifeAtlas.randomMemory();
}

function addMemoryMode() {
    lifeAtlas.addMemoryMode();
}

function closeModal() {
    lifeAtlas.closeModal();
}

function closeDetailModal() {
    lifeAtlas.closeDetailModal();
}

function applyFilters() {
    lifeAtlas.applyFilters();
}

function clearFilters() {
    lifeAtlas.clearFilters();
}

function editMemory() {
    lifeAtlas.editMemory();
}

function deleteMemory() {
    lifeAtlas.deleteMemory();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lifeAtlas = new LifeAtlas();
});

// Handle page visibility changes to save data
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.lifeAtlas) {
        window.lifeAtlas.saveToStorage();
    }
});

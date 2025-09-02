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
        
        const popup

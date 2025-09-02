# 🧭 Life Atlas

> *Map your memories. Explore yourself.*

Life Atlas is a personal digital memory map that transforms the way you organize and explore your life experiences. Instead of traditional chronological journaling, Life Atlas lets you pin memories to real-world locations, creating an interactive map of your personal journey.

## ✨ Features

### 🗺️ Interactive Memory Mapping
- **Real-world locations**: Pin memories to actual places using OpenStreetMap
- **Custom memory pins**: Each pin displays a mood emoji and contains your story
- **Intuitive interface**: Simply click to add memories anywhere on the map

### 📝 Rich Memory Creation
- **Detailed entries**: Title, date, description, and mood for each memory
- **Mood tracking**: 8 different mood options from 😊 Happy to 🌙 Dreamy
- **Flexible dating**: Backdate memories or use today's date

### 🔍 Powerful Exploration
- **Smart filtering**: Filter memories by mood, date range, or combination
- **Random discovery**: Jump to surprise memories with the random button
- **Visual clustering**: See your life patterns emerge on the map

### 🎨 Beautiful Design
- **Vintage aesthetic**: Warm, nostalgic design inspired by classic explorer journals
- **Smooth animations**: Ripple effects, hover states, and transitions
- **Responsive design**: Works perfectly on desktop and mobile devices

## 🚀 Getting Started

### Quick Start
1. **Visit the app**: Open `index.html` in your web browser
2. **Add your first memory**: Click the 📍 button, then click anywhere on the map
3. **Fill in details**: Add a title, description, and select your mood
4. **Explore**: Use the 🔍 Explore and 🎲 Random buttons to rediscover your memories

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/life-atlas.git

# Navigate to the project
cd life-atlas

# Open in your browser
open index.html
```

## 🛠️ Technical Details

### Built With
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Storage**: Browser localStorage (client-side only)
- **Fonts**: Google Fonts (Amatic SC, Kalam)

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
life-atlas/
├── index.html          # Main application file
├── css/
│   └── styles.css      # All styling and animations
├── js/
│   └── app.js          # Application logic and memory management
├── README.md           # This file
├── LICENSE             # MIT license
└── docs/               # Documentation and screenshots
    ├── screenshot.png
    └── user-guide.md
```

## 🎯 Key Features Explained

### Memory Pins
Each memory appears as a custom pin on the map with:
- **Visual mood indicator**: Emoji showing the memory's emotional tone
- **Hover effects**: Smooth scaling and shadow animations
- **Click to explore**: Opens a popup with memory preview

### Memory Management
- **Create**: Click-to-place interface with comprehensive form
- **Edit**: Full editing capabilities for existing memories
- **Delete**: Safe deletion with confirmation dialog
- **Filter**: Multiple filter options for focused exploration

### Data Privacy
- **100% local**: All data stays on your device
- **No tracking**: No analytics, cookies, or external data collection
- **Export ready**: Easy backup and transfer capabilities (coming soon)

## 🎨 Design Philosophy

Life Atlas embraces a **"vintage explorer"** aesthetic that makes memory mapping feel like creating a personal treasure map. The design combines:

- **Warm color palette**: Browns, creams, and earth tones
- **Handwritten typography**: Friendly, personal feeling fonts
- **Subtle animations**: Enhances interaction without distraction
- **Intuitive controls**: Complex features with simple interfaces

## 🔧 Configuration

### Default Settings
- **Map center**: New York City (auto-detects user location if permitted)
- **Default zoom**: City level (zoom 10)
- **Date format**: Browser locale default
- **Storage**: localStorage with automatic saving

### Customization
The app is designed to be easily customizable:
- **Colors**: Modify CSS custom properties in `styles.css`
- **Moods**: Add new mood options in the JavaScript mood array
- **Map style**: Change to different tile providers in `app.js`

## 📱 Mobile Experience

Life Atlas is fully responsive and optimized for mobile use:
- **Touch-friendly**: Large buttons and touch targets
- **Swipe gestures**: Natural map navigation
- **Vertical layout**: Optimized modal layouts for small screens
- **Performance**: Lightweight and fast on mobile networks

## 🔒 Privacy & Data

### What We Store
- **Memory content**: Titles, descriptions, dates, moods
- **Location data**: Latitude/longitude coordinates only
- **User preferences**: Filter settings and app state

### What We Don't Store
- **Personal identification**: No names, emails, or accounts
- **External data**: No cloud storage or remote databases
- **Tracking data**: No analytics or usage statistics

### Data Control
- **Local only**: All data remains on your device
- **Easy backup**: Export functionality (coming soon)
- **Complete deletion**: Clear all data anytime in browser settings

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- **Code style**: Use consistent formatting and meaningful variable names
- **Comments**: Document complex functions and business logic
- **Testing**: Test on multiple browsers and devices
- **Performance**: Keep the app lightweight and responsive

### Ideas for Contributions
- **New features**: Tags, photo uploads, export/import
- **Design improvements**: Themes, animations, accessibility
- **Technical enhancements**: Performance, browser compatibility
- **Documentation**: Tutorials, guides, translations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap**: For providing free, open map data
- **Leaflet**: For the excellent mapping library
- **Google Fonts**: For beautiful typography
- **The community**: For inspiration and feedback

**Made with ❤️ for memory keepers and life explorers**

*Start mapping your memories today and discover the stories your locations tell.*

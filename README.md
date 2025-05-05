# Hollow-Core Slab Calculator

A lightweight, client-side web application for civil engineers and precast estimators. This tool combines a modern chat interface with powerful engineering calculations, all while running completely offline.

![Application Screenshot](docs/demo.png)

## ✨ Features

### Modern Chat Interface
- WhatsApp/Slack-style messaging system
- Multi-tab project management with autosave
- Dark/light theme support
- Smart auto-scroll with "New messages" indicator
- In-place message editing
- Image support with lightbox preview
- Message search functionality

### Engineering Tools
- Integrated hollow-core slab calculator
- Support for both Imperial (ft/psf) and Metric (m/kPa) units
- Visual capacity charts
- Alternative configuration suggestions

### Technical Highlights
- 100% client-side - works offline via `file://`
- No frameworks or dependencies
- Modular JavaScript architecture
- LocalStorage persistence
- Export/restore functionality (HTML, PDF, TXT, JSON)

## 🚀 Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hollow-core-calculator.git
   ```

2. Open `index.html` in any modern web browser

3. Start using the application:
   - Create a new project tab
   - Type messages or use the slab calculator (📐)
   - Toggle theme (🌙) or search messages (🔍)
   - Export your work using the toolbar buttons

## 📁 Project Structure

```
/
├── index.html          # Main entry point
├── css/               # Stylesheets
├── data/              # Engineering data
├── docs/              # Documentation
├── js/
│   ├── core/         # Core logic (calculations, charts)
│   ├── shell/        # UI components
│   ├── tools/        # Engineering utilities
│   └── main.js       # Application entry
├── export.js         # Export functionality
└── storage.js        # Data persistence
```

## 🛠️ Development

### Architecture
The application follows a modular architecture:
- **Core**: Low-level logic (calculations, data processing)
- **Shell**: UI layer (chat interface, tab management)
- **Tools**: Engineering utilities (slab calculator)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Code Style
- Follow existing code formatting
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and modular

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, please:
1. Check the [documentation](docs/)
2. Open an issue
3. Contact the maintainers

---

Built with ❤️ for civil engineers and precast estimators. 
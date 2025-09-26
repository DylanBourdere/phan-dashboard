# Phan Dashboard

A modern, elegant dashboard for visualizing and tracking Phan reports with an exceptional user interface.

[![GitHub stars](https://img.shields.io/github/stars/dylanbourdere/phan-dashboard?style=social)](https://github.com/dylanbourdere/phan-dashboard)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- **Modern UI** with dark/light mode
- **Interactive filtering** by severity and file
- **Progress tracking** with checkboxes
- **Persistent state** across sessions
- **Real-time search** and sorting

## Quick Start

```bash
# Clone and install
git clone https://github.com/dylanbourdere/phan-dashboard.git
cd phan-dashboard
npm install

# Start development server
npm start
```

Open `index.html` in your browser and drag & drop your Phan report.

## Supported Formats

- **JSON**: `vendor/bin/phan --output-mode json > report.json`
- **XML**: `vendor/bin/phan --output-mode checkstyle > report.xml`

## Usage

1. **Import** your Phan report (JSON/XML)
2. **Filter** by severity, file, or search text
3. **Track progress** by checking off resolved issues
4. **Export** your progress state

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS
- **Storage**: localStorage
- **Architecture**: Modern ES6 classes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

⭐ **Star this project if you find it helpful!** ⭐
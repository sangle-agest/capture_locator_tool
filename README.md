# 🧠 Smart Locator Inspector (SLI)

A real-time, interactive DOM element inspector that uses Chrome DevTools Protocol (CDP) to highlight elements under the mouse and display automation-friendly locators (XPath, CSS, ID, name, aria-label, etc.) in an on-screen modal.

Perfect for QA engineers and automation testers who need to quickly identify stable, reusable locators without manually using Chrome DevTools.

## 🎯 Features

- **Real-time hover detection** - Instantly highlights elements as you move your mouse
- **Smart locator generation** - Generates ID, Name, CSS selectors, and intelligent XPath
- **Floating info modal** - Non-intrusive panel showing all locator information
- **Copy functionality** - Click any locator to copy it to clipboard
- **Freeze function** - Press Ctrl to pause selection and examine elements
- **Stable locator prioritization** - Prefers reliable attributes over dynamic ones
- **Visual highlighting** - Clear element boundaries with animated feedback

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Google Chrome** - Make sure Chrome is installed and accessible
- **Windows 11** - Optimized for Windows environment

### Installation

```bash
# Navigate to project directory
cd capture_tool

# Install dependencies
npm install

# Run the tool
npm start https://example.com
```

### Basic Usage

```bash
# Inspect any website
node smart-locator.js https://google.com

# Inspect local HTML files
node smart-locator.js file:///C:/path/to/your/local.html

# Inspect development servers
node smart-locator.js http://localhost:3000
```

## 🎮 User Interface

### Main Modal
The floating inspector panel displays:

| Field | Description | Example |
|-------|-------------|---------|
| **Tag** | HTML element tag | `button`, `input`, `div` |
| **ID** | Element ID attribute | `login-btn`, `username` |
| **Name** | Name attribute | `email`, `password` |
| **CSS** | CSS selector | `#login-btn`, `.form-control` |
| **XPath** | Smart XPath locator | `//*[@id="login-btn"]` |
| **Text** | Visible text content | `"Login"`, `"Submit"` |
| **Classes** | CSS classes | `btn btn-primary` |

### Controls

| Action | Key/Mouse | Description |
|--------|-----------|-------------|
| **Hover** | Mouse movement | Highlight elements and update locators |
| **Freeze** | `Ctrl` key | Lock current selection for examination |
| **Copy** | Click locator field | Copy specific locator to clipboard |
| **Exit** | `Esc` key | Close inspector and return to normal browsing |

### Visual Feedback

- **Red highlight** - Normal hover mode
- **Blue highlight with pulse** - Frozen selection mode
- **Toast notifications** - Copy confirmations and status updates

## 🧩 Locator Generation Logic

### Priority System

1. **ID-based locators** (highest priority)
   - Uses element ID if stable (not dynamically generated)
   - Example: `#login-button`

2. **Attribute-based locators**
   - Prioritizes: `data-test`, `data-testid`, `name`, `role`
   - Example: `[data-test="submit-form"]`

3. **Text-based XPath** (for buttons/links)
   - Uses visible text content
   - Example: `//button[contains(text(),"Login")]`

4. **Class-based selectors**
   - Filters out dynamic/random classes
   - Example: `.btn.btn-primary`

5. **Hierarchical XPath** (fallback)
   - Builds path from parent elements
   - Example: `//div[@class="form"]//button[2]`

### Smart Filtering

The tool automatically avoids:
- Random/generated IDs (containing 3+ consecutive digits)
- Temporary or UUID-based attributes
- Dynamic class names with timestamps or random values

## 🔧 Configuration

### Chrome Path Setup (if needed)

If Chrome isn't found automatically, set the environment variable:

```bash
# Windows PowerShell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"

# Windows CMD
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### Debug Port

Default debug port is `9222`. If you need to change it, modify the `debugPort` in `smart-locator.js`:

```javascript
this.debugPort = 9223; // Change to your preferred port
```

## 🛠️ Technical Architecture

```
User runs Node CLI tool
         ↓
Launch Chrome with remote debugging port
         ↓
Connect to Chrome via CDP
         ↓
Inject Inspector JS into page context
         ↓
Listen for mousemove events
         ↓
Highlight hovered element + Update floating modal
```

### Components

1. **smart-locator.js** - Node.js launcher and CDP controller
2. **injector.js** - Browser-injected inspector script
3. **package.json** - Dependencies and npm scripts

## 🧪 Examples

### Testing Different Websites

```bash
# E-commerce sites
node smart-locator.js https://amazon.com

# Forms and inputs
node smart-locator.js https://forms.gle/example

# Single Page Applications
node smart-locator.js https://react-app.com

# Local development
node smart-locator.js http://localhost:8080
```

### Sample Output

When hovering over a login button:

```
Tag: button
ID: loginSubmit
Name: login
CSS: button#loginSubmit
XPath: //*[@id="loginSubmit"]
Text: "Sign In"
Classes: btn btn-primary btn-lg
```

## 🐛 Troubleshooting

### Common Issues

**Chrome not found**
```
Solution: Install Chrome or set CHROME_PATH environment variable
```

**Connection failed**
```
Solution: Make sure Chrome isn't already running with debugging enabled
```

**Elements not highlighting**
```
Solution: Try refreshing the page or restarting the tool
```

**Permission errors**
```
Solution: Run terminal as Administrator if needed
```

### Debug Mode

Add console logging to see detailed CDP communication:

```javascript
// In smart-locator.js, add:
console.log('CDP Message:', message);
```

## 🔮 Future Enhancements

- [ ] **Export page object model** - Generate complete page object files
- [ ] **Playwright integration** - Support for Playwright selectors
- [ ] **Chrome extension version** - Persistent browser extension
- [ ] **Multi-element capture** - Select and store multiple elements
- [ ] **Configurable preferences** - Customize locator priorities
- [ ] **Screenshot capture** - Visual element documentation
- [ ] **Selenium integration** - Direct WebDriver compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use in your automation projects!

## 🙏 Acknowledgments

- Chrome DevTools Protocol team
- Puppeteer project
- QA automation community

---

**Happy Testing!** 🎯

For questions or support, please open an issue on the GitHub repository.
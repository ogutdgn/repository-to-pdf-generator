# GitHub Repository PDF Generator

Transform any GitHub repository into a beautifully formatted PDF document with just a few clicks. Perfect for code reviews, archiving, offline reading, or sharing complete project snapshots.

## ✨ Key Features

### Smart Repository Management
- **Interactive Menu System**: Navigate through repositories with an intuitive CLI interface
- **Clone Directly**: Add new repositories directly from the menu using GitHub URLs
- **Selective Processing**: Choose to convert entire repositories or specific subdirectories
- **Custom Naming**: Name your PDF files however you want

### Intelligent Processing
- **Directory Tree Visualization**: ASCII-style tree structure showing project layout
- **Smart File Detection**: Automatically includes 20+ file types (.js, .py, .java, .cs, .md, .html, .css, and more)
- **Size-Aware**: Large files (>200KB) show first 100 lines with a warning
- **Line Limit Protection**: Files over 1,000 lines are truncated with a clear message
- **Minified File Exclusion**: Automatically skips .min.js and .min.css files
- **Directory Filtering**: Excludes node_modules, .git, bin, obj, and other build artifacts

### Beautiful PDF Output
- **Title Page**: Repository name, date, and total file count
- **Directory Tree**: Visual representation of your project structure
- **Numbered Lines**: Every line of code is numbered for easy reference
- **Page Numbers**: Professional page numbering on every page
- **Clean Formatting**: Proper spacing, headers, and readable fonts
- **UTF-8 Support**: Handles international characters and special symbols

### Go-Back Navigation
- Navigate through menus with ease
- Return to previous selections at any step
- Cancel operations before completion

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Basic Usage

1. **Launch the tool**:
   ```bash
   npm start
   ```

2. **Choose an action**:
   - Select an existing repository from the list
   - Or clone a new repository from GitHub

3. **Select scope**:
   - Process entire repository
   - Or choose a specific subdirectory

4. **Customize output**:
   - Enter a custom PDF filename
   - Or use the default naming

5. **Done!** Your PDF is saved in the `output/` directory

## 📖 Detailed Usage

### Method 1: Clone First, Then Generate

```bash
# Manual clone
cd target-repo
git clone https://github.com/username/awesome-project.git
cd ..

# Generate PDF
npm start
# Select: awesome-project → Process entire repository → Confirm
```

### Method 2: Clone from Menu

```bash
npm start
# Select: "Clone a new repository from GitHub"
# Enter: https://github.com/username/awesome-project.git
# Wait for cloning...
# Then follow prompts to generate PDF
```

### Processing Specific Directories

Perfect for large repositories where you only need certain parts:

```bash
npm start
# Select your repository
# Choose: "Select a subdirectory"
# Pick: src/ (or docs/, lib/, etc.)
# Result: PDF contains only that folder
```

## 📋 What's in the PDF?

Each generated PDF includes:

### 1. Title Page
- Repository name in large, bold text
- Generation timestamp
- Total number of files included
- Selected directory (if subdirectory was chosen)

### 2. Directory Tree
Beautiful ASCII-style visualization:
```
repository-name/
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   └── Footer.js
│   └── utils/
│       └── helpers.js
├── README.md
└── package.json
```

### 3. File Contents
For each file:
- **Header**: Full file path and metadata
- **Code Block**: Complete content with line numbers
- **Formatting**: Monospace font, proper indentation
- **Large File Notice**: Warning if file is truncated

### 4. Page Numbers
Every page includes: `Page X of Y` at the bottom center

## ⚙️ Configuration

### Supported File Types

Currently includes: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cs`, `.cpp`, `.c`, `.h`, `.html`, `.css`, `.scss`, `.json`, `.xml`, `.yml`, `.yaml`, `.md`, `.txt`, `.sql`, `.sh`, `.bash`, `.php`, `.rb`, `.go`, `.rs`, `.swift`, `.kt`, `.sln`, `.csproj`, `.config`, `.gitignore`

**Add more** in [script.js](script.js):
```javascript
const INCLUDED_EXTENSIONS = [
  // ... existing extensions
  '.vue', '.svelte', '.dart'  // Add your extensions
];
```

### Excluded Directories

Default: `node_modules`, `.git`, `bin`, `obj`, `.vs`, `.vscode`, `build`, `dist`, `out`, `target`, `__pycache__`, `.idea`

**Customize** in [script.js](script.js):
```javascript
const EXCLUDED_DIRS = [
  // ... existing exclusions
  'vendor', 'tmp', 'cache'  // Add more to exclude
];
```

### File Size Limits

- **Max file size**: 200KB (larger files show first 100 lines)
- **Max lines shown**: 1,000 lines per file
- **Adjust** in [script.js](script.js):
  ```javascript
  const MAX_FILE_SIZE = 200 * 1024;  // Change as needed
  const MAX_LINES_TO_SHOW = 1000;     // Adjust line limit
  ```

## 📁 Project Structure

```
repository-to-pdf-generator/
├── script.js              # Main application with all logic
├── package.json           # Node.js dependencies
├── LICENSE                # MIT License
├── README.md              # This comprehensive guide
├── QUICKSTART.md          # Quick reference guide
├── .gitignore             # Git ignore rules
├── target-repo/           # Your cloned repositories (auto-created)
│   └── your-repo/        # Cloned GitHub repositories go here
└── output/               # Generated PDFs (auto-created)
    └── *.pdf             # Your generated PDF files
```

## 💡 Output Examples

PDFs are automatically named based on your selections:

- **Full repository**: `awesome-project_2026-01-30.pdf`
- **With subdirectory**: `awesome-project_src_2026-01-30.pdf`
- **Custom name**: `my-custom-name.pdf` (your choice!)

## 🔧 Technical Details

### Requirements
- **Node.js**: Version 16 or higher (for ES modules support)
- **npm** or **yarn**: Package manager
- **Git**: For cloning repositories

### Dependencies
- **pdfkit** (0.15.0): Professional PDF generation
- **inquirer** (9.2.12): Interactive CLI prompts

### Character Encoding
- Primary: UTF-8 with full Unicode support
- Fallback: Latin1 for compatibility
- Automatic BOM removal and normalization

### Performance Notes
- Small repos (<50 files): 10-30 seconds
- Medium repos (50-200 files): 1-3 minutes  
- Large repos (200+ files): 3-10 minutes
- Progress shown for each file processed

## 🎯 Use Cases

- **Code Reviews**: Share complete project structure with reviewers
- **Documentation**: Create offline code archives
- **Portfolio**: Include full project code in PDF portfolios
- **Backups**: Maintain readable backups of important code
- **Education**: Share educational codebases with students
- **Audits**: Provide code snapshots for compliance
- **Presentations**: Attach code documentation to proposals

## 🐛 Troubleshooting

### No repositories found
**Problem**: "No folders found in target-repo directory"  
**Solution**: Clone at least one repository into `target-repo/`:
```bash
cd target-repo && git clone <repo-url> && cd ..
```

### No files generated
**Problem**: "No files found in the selected directory"  
**Solutions**:
- Directory may only have excluded folders (node_modules, etc.)
- Check if file extensions are in the INCLUDED_EXTENSIONS list
- Try processing a different subdirectory

### Git clone fails
**Problem**: Repository cloning error  
**Solutions**:
- Verify the GitHub URL is correct
- Check internet connection
- For private repos, ensure you have access
- Try using SSH URL if HTTPS fails

### PDF looks weird
**Problem**: Character encoding issues  
**Solution**: The tool automatically handles UTF-8 and Latin1. Special characters and emojis are processed safely.

### Generation is slow
**Problem**: Taking too long to generate  
**Solutions**:
- This is normal for large repos (be patient!)
- Try processing a specific subdirectory instead
- Increase file size limits to skip large files faster

## 🤝 Contributing

This is an MIT licensed open-source project. Feel free to:
- Fork and modify for your needs
- Submit issues and feature requests
- Share improvements and bug fixes
- Use in commercial or personal projects

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

Free to use, modify, and distribute. No attribution required but appreciated!

## 🔒 Privacy & Security

- **100% Local**: All processing happens on your machine
- **No Network Calls**: Except for git clone operations
- **No Data Collection**: Zero analytics or tracking
- **No External APIs**: Pure local file processing

---

**Made with ❤️ for developers who love documentation**

Need help? Check out [QUICKSTART.md](QUICKSTART.md) for a quick reference guide!

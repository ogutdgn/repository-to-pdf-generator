# GitHub Repository PDF Generator

A Node.js tool that generates a comprehensive PDF copy of all code files in a GitHub repository.

## Features

- 📁 Select repositories from `target-repo` directory
- 📂 Choose specific subdirectories to process
- 📄 Generates PDF with file paths, code, and line numbers
- 📊 Includes table of contents
- 🔢 Automatic page numbering
- ⚡ Filters out unnecessary directories (node_modules, bin, obj, etc.)
- 🎯 Supports multiple file types (.js, .py, .java, .cs, .md, etc.)

## Installation

1. Install dependencies:
```bash
npm install
```

## Usage

1. Clone your target repository into the `target-repo` directory:
```bash
cd target-repo
git clone <your-repo-url>
cd ..
```

2. Run the script:
```bash
npm start
```

3. Follow the interactive prompts:
   - Select a repository from the list
   - Choose to process the entire repository or a specific subdirectory
   - Confirm PDF generation

4. Find your PDF in the `output` directory

## Example

```bash
# Clone a repository
cd target-repo
git clone https://github.com/username/repository-name.git
cd ..

# Generate PDF
npm start
```

The script will:
- Show available repositories
- Let you choose between processing the entire repo or a subdirectory
- Generate a PDF with all code files
- Save it as `output/repository-name_2026-01-30.pdf`

## PDF Contents

Each PDF includes:

1. **Title Page**: Repository name, generation date, file count
2. **Table of Contents**: List of all files
3. **File Pages**: For each file:
   - File path relative to selected directory
   - File size and modification date
   - Complete file content with line numbers
   - Page numbers on every page

## Customization

### Add more file extensions

Edit the `INCLUDED_EXTENSIONS` array in [script.js](script.js):

```javascript
const INCLUDED_EXTENSIONS = [
  '.js', '.ts', '.py', '.java', '.cs',
  // Add your extensions here
  '.go', '.rb', '.php'
];
```

### Exclude more directories

Edit the `EXCLUDED_DIRS` array in [script.js](script.js):

```javascript
const EXCLUDED_DIRS = [
  'node_modules', '.git', 'bin', 'obj',
  // Add directories to exclude
  'temp', 'cache'
];
```

## Project Structure

```
github-getting-pdf-copy/
├── script.js          # Main application
├── package.json       # Dependencies
├── LICENSE            # MIT License
├── target-repo/       # Place cloned repos here
│   └── your-repo/    # Your cloned repositories
└── output/           # Generated PDFs (created automatically)
```

## Requirements

- Node.js 16+ (for ES modules)
- npm or yarn

## Dependencies

- `pdfkit`: PDF generation
- `inquirer`: Interactive command-line prompts

## Output

PDFs are saved in the `output` directory with the format:
- `repository-name_YYYY-MM-DD.pdf` (for entire repository)
- `repository-name_subdirname_YYYY-MM-DD.pdf` (for subdirectory)

## Tips

- For large repositories, processing may take a few minutes
- The script shows progress for each file being processed
- Very long lines are truncated to fit the page width
- Binary files and excluded extensions are automatically skipped

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Note**: This tool processes files locally. No data is sent anywhere.

# 🚀 Quick Start Guide

Get your first PDF in under 2 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs `pdfkit` and `inquirer` - the only two dependencies you need.

## Step 2: Add a Repository

### Option A: Clone Manually
```bash
cd target-repo
git clone https://github.com/username/awesome-project.git
cd ..
```

### Option B: Clone from Menu
Just run `npm start` and select **"Clone a new repository from GitHub"** when prompted!

## Step 3: Generate Your PDF

```bash
npm start
```

That's it! Now follow the interactive prompts.

---

## 📝 Complete Interactive Flow

Here's exactly what you'll see and do:

### 1️⃣ Main Menu

```
? What would you like to do?
  > Select an existing repository
    Clone a new repository from GitHub
    Exit
```

**Choose** an option:
- **Select existing**: Pick from repositories in `target-repo/`
- **Clone new**: Enter a GitHub URL to clone
- **Exit**: Quit the application

### 2️⃣ Repository Selection

```
? Select a repository to convert:
  > awesome-project
    another-repo
    my-library
```

**Select** the repository you want to convert to PDF.

💡 **Tip**: Use arrow keys to navigate, Enter to select.

### 3️⃣ Directory Scope

```
? What would you like to process?
  > Process entire repository
    Select a subdirectory
    ← Go back
```

**Choose**:
- **Entire repository**: Convert all files in all folders
- **Subdirectory**: Pick a specific folder (src, docs, lib, etc.)
- **Go back**: Return to repository selection

### 4️⃣ Subdirectory Selection (if chosen)

```
? Select a subdirectory:
  > awesome-project/src/
    awesome-project/docs/
    awesome-project/tests/
    ← Go back
```

**Pick** the specific folder you want in your PDF.

Shows a hierarchical view with full paths for clarity.

### 5️⃣ Custom PDF Name (Optional)

```
? Enter PDF filename (or press Enter for default):
```

**Options**:
- **Press Enter**: Use automatic naming (`repository-name_2026-01-30.pdf`)
- **Type name**: Custom filename (e.g., `my-code-review.pdf`)

✨ The `.pdf` extension is added automatically!

### 6️⃣ Confirmation

```
Found 47 files to process.
? Do you want to generate the PDF?
  > Yes
    No (go back to menu)
```

**Confirm** to start PDF generation.

Shows total file count so you know what to expect.

### 7️⃣ Processing

```
Processing file 1/47: src/index.js
Processing file 2/47: src/utils/helpers.js
Processing file 3/47: README.md
...
```

Watch the progress as each file is added to your PDF!

### 8️⃣ Success!

```
✓ PDF generated successfully!
  Output: output/awesome-project_2026-01-30.pdf

Press any key to continue...
```

**Done!** Your PDF is ready in the `output/` folder.

---

## 🎯 Common Workflows

### Workflow 1: Full Repository PDF

```bash
npm start
# 1. Select: awesome-project
# 2. Choose: Process entire repository
# 3. Press Enter for default filename
# 4. Confirm: Yes
# ✓ Done! Check output/awesome-project_2026-01-30.pdf
```

**Best for**: Small to medium projects, complete documentation

### Workflow 2: Specific Folder Only

```bash
npm start
# 1. Select: awesome-project
# 2. Choose: Select a subdirectory
# 3. Pick: awesome-project/src/
# 4. Enter custom name: "source-code"
# 5. Confirm: Yes
# ✓ Done! Check output/source-code.pdf
```

**Best for**: Large projects, specific code reviews, partial documentation

### Workflow 3: Clone and Convert

```bash
npm start
# 1. Choose: Clone a new repository from GitHub
# 2. Enter: https://github.com/facebook/react.git
# 3. Wait for cloning...
# 4. Select: react
# 5. Choose: Select a subdirectory → react/packages/
# 6. Name it: "react-packages"
# 7. Confirm: Yes
# ✓ Done!
```

**Best for**: Quick analysis of new repositories

---

## 💡 Pro Tips

### ✅ DO:
- **Clone first** if you want the repo on disk permanently
- **Use subdirectory** selection for large repos (faster!)
- **Custom names** for specific purposes ("code-review", "v2.0-snapshot")
- **Check file count** before confirming (adjust if needed)
- **Process incrementally** for huge repos (docs/ first, then src/, etc.)

### ❌ DON'T:
- Clone massive repos without subdirectory selection (will be slow)
- Expect real-time generation (large repos take time)
- Worry about emojis or special characters (handled automatically!)
- Include node_modules or build folders (already excluded)

---

## 📊 What to Expect

### File Limits
- **Max file size**: 200KB (larger files show first 100 lines only)
- **Max lines**: 1,000 lines per file (truncated with message)
- **Minified files**: Automatically skipped (.min.js, .min.css)

### Processing Time
| Repo Size | File Count | Time |
|-----------|-----------|------|
| Small | <50 files | 10-30s |
| Medium | 50-200 files | 1-3 min |
| Large | 200-500 files | 3-7 min |
| Very Large | 500+ files | 7-15 min |

### PDF Size
Roughly **50-100KB per code file** on average.  
Example: 100 files ≈ 5-10MB PDF

---

## 🔧 Troubleshooting Quick Fixes

### "No folders found"
```bash
# Fix: Clone a repository first
cd target-repo
git clone https://github.com/username/repo.git
cd ..
npm start
```

### "No files found"
- Try a different subdirectory
- Check if repo only has excluded folders (node_modules, build, etc.)
- Verify file extensions are supported (.js, .py, .md, etc.)

### Clone fails
- Check GitHub URL formatting
- Ensure you have access (public repo or authenticated for private)
- Try: `git clone <url>` manually to see the actual error

### PDF missing files
- Check excluded directories list (node_modules, .git, bin, etc.)
- Verify file extensions are in INCLUDED_EXTENSIONS
- Large files (>200KB) only show first 100 lines

---

## 🎨 Example Output Structure

Your PDF will look like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    AWESOME PROJECT
    Generated: Jan 30, 2026
    Files: 47
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Structure:
awesome-project/
├── src/
│   ├── index.js
│   └── utils/
│       └── helpers.js
├── README.md
└── package.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

File: src/index.js
Modified: 2026-01-29
Size: 1.2 KB

1  import { helper } from './utils/helpers.js';
2  
3  function main() {
4    console.log('Hello World');
5  }
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Page 3 of 15
```

---

## 🚦 Next Steps

1. ✅ Generate your first PDF
2. 📖 Read the [README.md](README.md) for advanced configuration
3. ⚙️ Customize file extensions and exclusions in [script.js](script.js)
4. 🔄 Share your PDFs with your team!

---

**Need more details?** Check the full [README.md](README.md) for:
- Complete feature list
- Configuration options
- Use cases and examples
- Troubleshooting guide

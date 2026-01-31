# Quick Start Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Clone a Repository

Clone any GitHub repository into the `target-repo` directory:

```bash
cd target-repo
git clone https://github.com/username/repository-name.git
cd ..
```

## Step 3: Generate PDF

```bash
npm start
```

### What will happen:

1. **Repository Selection**:
   - You'll see your cloned repository as an available option
   - Select it from the list

2. **Subdirectory Selection**:
   - Option 1: Process entire repository (all folders)
   - Option 2: Select a specific subdirectory (e.g., "src", "docs", "lib")

3. **Confirmation**:
   - You'll see how many files were found
   - Confirm to generate the PDF

4. **Processing**:
   - The script will process each file and show progress
   - This may take 1-5 minutes depending on repository size

5. **Output**:
   - PDF will be saved in `output/` directory
   - Filename example: `repository-name_2026-01-30.pdf`

## Example Workflow

```bash
# From the project root
npm start

# You'll see:
# Available repositories:
#   1. your-repository

# Select your repository
# Then choose: "Process entire repository" or "Select a subdirectory"
# If subdirectory: choose the folder you want (e.g., "src", "docs")
# Confirm: Yes
# Wait for PDF generation...
# Done! Check output/ folder
```

## Tips for Selective Processing

### To process only a specific folder:
1. Run `npm start`
2. Select your repository
3. Choose "Select a subdirectory"
4. Select the folder you want (e.g., `src`, `docs`, `lib`)
5. Confirm

This will create a PDF with only files from that specific directory.

### To process the entire repository:
Choose "Process entire repository" when prompted.

## Adding New Repositories

```bash
cd target-repo
git clone https://github.com/username/another-repo.git
cd ..
npm start
```

Now you'll see both repositories in the list!

## Troubleshooting

**Problem**: "No folders found in target-repo directory"
- **Solution**: Make sure you have cloned at least one repository into `target-repo/`

**Problem**: "No files found in the selected directory"
- **Solution**: The directory might only contain excluded folders (node_modules, bin, etc.) or file types not in the included list

**Problem**: PDF generation is slow
- **Solution**: This is normal for large repositories. Each file is being processed and formatted.

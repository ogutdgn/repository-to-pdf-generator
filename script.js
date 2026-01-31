import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TARGET_REPO_DIR = path.join(__dirname, 'target-repo');
const OUTPUT_DIR = path.join(__dirname, 'output');

// File size and content limits
const MAX_FILE_SIZE = 200 * 1024; // 200KB - skip files larger than this
const MAX_LINES_TO_SHOW = 1000; // Show only first 1000 lines of large files
const SKIP_MINIFIED = true; // Skip .min.js, .min.css, etc.

// File extensions to include (add more as needed)
const INCLUDED_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.c', '.h',
  '.html', '.css', '.scss', '.json', '.xml', '.yml', '.yaml', '.md', '.txt',
  '.sql', '.sh', '.bash', '.php', '.rb', '.go', '.rs', '.swift', '.kt',
  '.sln', '.csproj', '.config', '.gitignore', '.env.example'
];

// Directories to exclude
const EXCLUDED_DIRS = [
  'node_modules', '.git', 'bin', 'obj', '.vs', '.vscode', 
  'build', 'dist', 'out', 'target', '__pycache__', '.idea'
];

/**
 * Get all available folders in target-repo directory
 */
function getAvailableFolders() {
  if (!fs.existsSync(TARGET_REPO_DIR)) {
    console.error(`Target repository directory not found: ${TARGET_REPO_DIR}`);
    return [];
  }

  const items = fs.readdirSync(TARGET_REPO_DIR);
  return items.filter(item => {
    const fullPath = path.join(TARGET_REPO_DIR, item);
    return fs.statSync(fullPath).isDirectory();
  });
}

/**
 * Get subdirectories of a given path
 */
function getSubdirectories(basePath) {
  const items = fs.readdirSync(basePath);
  const dirs = items.filter(item => {
    const fullPath = path.join(basePath, item);
    return fs.statSync(fullPath).isDirectory() && !EXCLUDED_DIRS.includes(item);
  });
  return dirs;
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      const ext = path.extname(file);
      const fileName = path.basename(file);
      
      // Skip minified files if configured
      if (SKIP_MINIFIED && fileName.includes('.min.')) {
        return;
      }
      
      if (INCLUDED_EXTENSIONS.includes(ext) || INCLUDED_EXTENSIONS.includes(file)) {
        // Mark files that are too large
        if (stat.size > MAX_FILE_SIZE) {
          console.log(`  Large file found: ${fileName} (${formatFileSize(stat.size)}) - will show warning`);
          arrayOfFiles.push({
            path: filePath,
            isLarge: true,
            size: stat.size
          });
        } else {
          arrayOfFiles.push({
            path: filePath,
            isLarge: false,
            size: stat.size
          });
        }
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Build directory tree structure
 */
function buildDirectoryTree(files, basePath) {
  const tree = {};
  
  files.forEach(fileObj => {
    const filePath = typeof fileObj === 'string' ? fileObj : fileObj.path;
    const relativePath = path.relative(basePath, filePath);
    const parts = relativePath.split(path.sep);
    
    let current = tree;
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    });
  });
  
  return tree;
}

/**
 * Render directory tree
 */
function renderTree(tree, doc, prefix = '', isRoot = true) {
  const entries = Object.keys(tree).sort((a, b) => {
    const aIsFile = tree[a] === null;
    const bIsFile = tree[b] === null;
    if (aIsFile && !bIsFile) return 1;
    if (!aIsFile && bIsFile) return -1;
    return a.localeCompare(b);
  });
  
  entries.forEach((key, index) => {
    if (doc.y > 720) {
      doc.addPage();
      doc.fontSize(9).font('Courier');
    }
    
    const isFile = tree[key] === null;
    const isLastEntry = index === entries.length - 1;
    
    // Use simple ASCII characters for tree structure
    const connector = isLastEntry ? '+-- ' : '|-- ';
    const extension = isLastEntry ? '    ' : '|   ';
    
    doc.fontSize(9).font('Courier').text(`${prefix}${connector}${key}`);
    
    if (!isFile) {
      renderTree(tree[key], doc, prefix + extension, false);
    }
  });
}

/**
 * Get top-level directory from relative path
 */
function getTopDirectory(relativePath) {
  const parts = relativePath.split(path.sep);
  return parts.length > 0 ? parts[0] : '';
}

/**
 * Get list of top-level directories
 */
function getTopLevelDirectories(files, basePath) {
  const dirs = new Set();
  files.forEach(fileObj => {
    const filePath = typeof fileObj === 'string' ? fileObj : fileObj.path;
    const relativePath = path.relative(basePath, filePath);
    const topDir = getTopDirectory(relativePath);
    if (topDir) {
      dirs.add(topDir);
    }
  });
  return Array.from(dirs).sort();
}

/**
 * Group files by top-level directory
 */
function groupFilesByTopDirectory(files, basePath) {
  const groups = {};
  files.forEach(fileObj => {
    const filePath = typeof fileObj === 'string' ? fileObj : fileObj.path;
    const relativePath = path.relative(basePath, filePath);
    const topDir = getTopDirectory(relativePath);
    if (!groups[topDir]) {
      groups[topDir] = [];
    }
    groups[topDir].push(fileObj);
  });
  return groups;
}

/**
 * Generate PDF from files
 */
async function generatePDF(files, selectedPath, outputFileName, repoPath, repoName) {
  return new Promise((resolve, reject) => {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 70, bottom: 60, left: 50, right: 50 },
      bufferPages: true
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    const baseFolder = path.basename(selectedPath);
    const isSubdirectory = selectedPath !== repoPath;
    
    // Track page numbers
    let currentPage = 1;

    // Project Directory Structure - First Page
    doc.fontSize(18).font('Helvetica-Bold').text(repoName, {
      align: 'center'
    });
    doc.moveDown(1.5);
    
    doc.fontSize(16).font('Helvetica-Bold').text('Project Directory Structure', {
      align: 'left'
    });
    doc.moveDown();
    
    const topDirs = getTopLevelDirectories(files, selectedPath);
    
    // If a subdirectory is selected, show the full repository structure
    if (isSubdirectory) {
      // Get all subdirectories in the repo root
      const repoSubdirs = getSubdirectories(repoPath);
      const selectedSubdir = path.basename(selectedPath);
      
      doc.fontSize(11).font('Courier').text(repoName);
      repoSubdirs.forEach((dir, index) => {
        const isLast = index === repoSubdirs.length - 1;
        const connector = isLast ? '+-- ' : '|-- ';
        
        if (dir === selectedSubdir) {
          // Show expanded tree for selected subdirectory
          doc.fontSize(10).font('Courier').text(`${connector}${dir} (selected)`);
          
          // Show contents of selected directory
          topDirs.forEach((subItem, subIndex) => {
            const isLastSub = subIndex === topDirs.length - 1;
            const subConnector = isLast ? '    ' : '|   ';
            const itemConnector = isLastSub ? '+-- ' : '|-- ';
            doc.fontSize(9).font('Courier').text(`${subConnector}${itemConnector}${subItem}`);
          });
        } else {
          // Just show directory name for others
          doc.fontSize(10).font('Courier').text(`${connector}${dir}`);
        }
      });
    } else {
      // Show normal tree structure
      doc.fontSize(11).font('Courier').text(baseFolder);
      topDirs.forEach((dir, index) => {
        const isLast = index === topDirs.length - 1;
        const connector = isLast ? '+-- ' : '|-- ';
        doc.fontSize(10).font('Courier').text(`${connector}${dir}`);
      });
    }
    doc.moveDown();
    
    // Group files by top-level directory
    const fileGroups = groupFilesByTopDirectory(files, selectedPath);

    // Helper function to add header
    const addHeader = (topDir) => {
      const currentY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold')
        .fillColor('#34495e')
        .text(topDir, 50, 30, { align: 'center' });
      doc.y = currentY;
      doc.fillColor('#000000');
    };

    // Process each top-level directory
    let processedFiles = 0;
    topDirs.forEach((topDir, dirIndex) => {
      // Start new page for each directory
      doc.addPage();
      addHeader(topDir);
      
      // Show directory title
      doc.fontSize(16).font('Helvetica-Bold')
        .fillColor('#2c3e50')
        .text(`${topDir}`, { align: 'left' });
      doc.moveDown(0.5);
      
      // Build and show tree for this directory only
      const dirFiles = fileGroups[topDir];
      const dirBasePath = path.join(selectedPath, topDir);
      const dirTree = buildDirectoryTree(dirFiles, dirBasePath);
      
      // Show tree with directory name as root
      doc.fontSize(10).font('Courier').text(topDir);
      renderTree(dirTree, doc, '');
      
      doc.moveDown(1);
      doc.strokeColor('#34495e').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
      
      // Process files in this directory
      dirFiles.forEach((fileObj, fileIndex) => {
        processedFiles++;
        
        const file = typeof fileObj === 'string' ? fileObj : fileObj.path;
        const isLarge = typeof fileObj === 'object' && fileObj.isLarge;
        const fileSize = typeof fileObj === 'object' ? fileObj.size : 0;
        
        const relativePath = path.relative(selectedPath, file);
        const baseFolder = path.basename(selectedPath);
        
        // Create hierarchical path display
        const pathParts = relativePath.split(path.sep);
        const hierarchicalPath = `${baseFolder} > ${pathParts.join(' > ')}`;

        // Check if we need space for file header (at least 100 points)
        if (doc.y > 700) {
          doc.addPage();
          addHeader(topDir);
        }

        // File header
        doc.fontSize(11).font('Helvetica-Bold')
          .fillColor('#2c3e50')
          .text(hierarchicalPath, {
            align: 'left'
          });

        doc.moveDown(0.3);
        doc.strokeColor('#bdc3c7').lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);

        // File content
        try {
          let content;
          
          // Try to read as UTF-8, if fails try with latin1
          try {
            content = fs.readFileSync(file, 'utf8');
          } catch (utf8Error) {
            console.log(`  UTF-8 failed for ${relativePath}, trying latin1...`);
            try {
              content = fs.readFileSync(file, 'latin1');
            } catch (latinError) {
              throw new Error('Unable to read file with any encoding');
            }
          }
          
          // Remove BOM (Byte Order Mark) if present
          if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
          }
          
          // Clean up any other BOM characters and normalize line endings
          content = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
          
          let lines = content.split('\n');
          const totalLines = lines.length;
          let truncated = false;
          let truncateReason = '';
          
          // For large files, show only first 100 lines
          if (isLarge) {
            lines = lines.slice(0, 100);
            truncated = true;
            truncateReason = 'large';
          }
          // For files with many lines, limit to MAX_LINES_TO_SHOW
          else if (lines.length > MAX_LINES_TO_SHOW) {
            lines = lines.slice(0, MAX_LINES_TO_SHOW);
            truncated = true;
            truncateReason = 'long';
          }

          doc.fontSize(8).font('Courier').fillColor('#000000');

          lines.forEach((line, lineNum) => {
            // Check if we need a new page (leave space for footer)
            if (doc.y > 750) {
              doc.addPage();
              addHeader(topDir);
              doc.fontSize(8).font('Courier').fillColor('#000000');
            }

            // Replace special characters that don't render well in PDF
            let cleanLine = line
              .replace(/\t/g, '    ') // Replace tabs with spaces
              .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
              .replace(/[\uFFFD\uFFFE\uFFFF]/g, ''); // Remove replacement characters
            
            // Remove all emojis and symbols silently
            cleanLine = cleanLine.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
            cleanLine = cleanLine.replace(/[\u{2600}-\u{26FF}]/gu, '');
            cleanLine = cleanLine.replace(/[\u{2700}-\u{27BF}]/gu, '');
            
            // Ensure string is valid UTF-8 for PDF
            cleanLine = cleanLine.normalize('NFC');

            // Line number and content with wrapping
            const lineNumber = String(lineNum + 1).padStart(4, ' ');
            const displayLine = `${lineNumber} | ${cleanLine}`;

            doc.text(displayLine, {
              width: 495,
              align: 'left'
            });
          });
          
          // Show truncation message if file was truncated
          if (truncated) {
            doc.moveDown(0.5);
            doc.fontSize(9).font('Helvetica-Bold')
              .fillColor('#e74c3c');
            
            if (truncateReason === 'large') {
              doc.text(`... File is too large (${formatFileSize(fileSize)}). Showing first 100 lines only ...`);
            } else {
              doc.text(`... File truncated. Showing first ${MAX_LINES_TO_SHOW} of ${totalLines} lines ...`);
            }
            
            doc.fillColor('#000000');
          }
          
          // Add small space after each file
          doc.moveDown(1);
          
        } catch (error) {
          doc.fontSize(10).font('Helvetica')
            .fillColor('#e74c3c')
            .text(`Error reading file: ${error.message}`);
          doc.moveDown(1);
        }

        console.log(`Processed: ${relativePath} (${processedFiles}/${files.length})`);
      });
    });

    // Add page numbers without creating new pages
    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      
      // Don't change Y position, just overlay the page number
      doc.fontSize(10).font('Helvetica').fillColor('black');
      const pageText = `${i + 1}`;
      const textWidth = doc.widthOfString(pageText);
      const x = (doc.page.width - textWidth) / 2;
      const y = doc.page.height - 40;
      
      doc.text(pageText, x, y, {
        lineBreak: false,
        continued: false
      });
    }

    doc.end();

    stream.on('finish', () => {
      console.log(`\n✓ PDF generated successfully: ${outputPath}`);
      resolve(outputPath);
    });

    stream.on('error', reject);
  });
}

/**
 * Clone a GitHub repository
 */
async function cloneRepository(repoUrl) {
  const urlMatch = repoUrl.match(/github\.com[\/:](.+?)\/(.+?)(\.git)?$/);
  if (!urlMatch) {
    console.error('Invalid GitHub URL format!');
    console.log('Example: https://github.com/owner/repo');
    return null;
  }

  const owner = urlMatch[1];
  const repo = urlMatch[2].replace('.git', '');
  const targetPath = path.join(TARGET_REPO_DIR, repo);

  // Check if already exists
  if (fs.existsSync(targetPath)) {
    console.log(`Repository "${repo}" already exists!`);
    return repo;
  }

  console.log();
  console.log('='.repeat(60));
  console.log(`Cloning ${owner}/${repo}...`);
  console.log('='.repeat(60));
  console.log();

  return new Promise((resolve, reject) => {
    const git = spawn('git', ['clone', repoUrl, targetPath]);

    git.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    git.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    git.on('close', (code) => {
      if (code === 0) {
        console.log();
        console.log('✓ Repository cloned successfully!');
        console.log();
        resolve(repo);
      } else {
        console.error('\nFailed to clone repository!');
        reject(new Error('Git clone failed'));
      }
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('GitHub Repository PDF Generator');
  console.log('='.repeat(60));
  console.log();

  // Create target-repo directory if it doesn't exist
  if (!fs.existsSync(TARGET_REPO_DIR)) {
    fs.mkdirSync(TARGET_REPO_DIR, { recursive: true });
  }

  // Get available folders
  let availableFolders = getAvailableFolders();
  
  // Create choices for the menu
  const choices = [];
  
  if (availableFolders.length > 0) {
    console.log('Available repositories:');
    availableFolders.forEach((folder, index) => {
      console.log(`  ${index + 1}. ${folder}`);
      choices.push({ name: folder, value: folder });
    });
    console.log();
    choices.push({ name: '+ Add new repository', value: '__ADD_NEW__' });
  } else {
    console.log('No repositories found in target-repo directory.');
    console.log();
    choices.push({ name: '+ Add new repository', value: '__ADD_NEW__' });
  }

  // Select repository or add new
  const { selectedOption } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedOption',
      message: 'Select a repository or add a new one:',
      choices: choices,
      loop: false
    }
  ]);

  let selectedRepo = selectedOption;

  // If user wants to add new repository
  if (selectedOption === '__ADD_NEW__') {
    const { repoUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'repoUrl',
        message: 'Enter GitHub repository URL (or leave empty to go back):',
        validate: (input) => {
          if (!input) return true; // Allow empty for go back
          if (!input.includes('github.com')) return 'Please enter a valid GitHub URL';
          return true;
        }
      }
    ]);

    // If empty, go back
    if (!repoUrl) {
      console.log();
      return main();
    }

    try {
      const clonedRepo = await cloneRepository(repoUrl);
      if (!clonedRepo) {
        return;
      }
      selectedRepo = clonedRepo;
    } catch (error) {
      console.error('Error cloning repository:', error.message);
      return;
    }
  }

  const repoPath = path.join(TARGET_REPO_DIR, selectedRepo);

  // Check for subdirectories
  const subdirs = getSubdirectories(repoPath);
  let selectedPath = repoPath;
  let pathLabel = selectedRepo;

  if (subdirs.length > 0) {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Do you want to process a specific subdirectory?',
        choices: [
          { name: 'Process entire repository', value: 'root' },
          { name: 'Select a subdirectory', value: 'subdir' },
          { name: '← Go back', value: 'back' }
        ],
        loop: false
      }
    ]);

    if (choice === 'back') {
      console.log();
      return main(); // Restart from beginning
    }

    if (choice === 'subdir') {
      const subdirChoices = [...subdirs, { name: '← Go back', value: '__GO_BACK__' }];
      
      const { selectedSubdir } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedSubdir',
          message: 'Select a subdirectory:',
          choices: subdirChoices,
          loop: false
        }
      ]);

      if (selectedSubdir === '__GO_BACK__') {
        console.log();
        return main(); // Restart from beginning
      }

      selectedPath = path.join(repoPath, selectedSubdir);
      pathLabel = `${selectedRepo}/${selectedSubdir}`;
    }
  }

  console.log();
  console.log(`Selected path: ${selectedPath}`);
  console.log('Scanning for files...');
  console.log();

  // Get all files
  const files = getAllFiles(selectedPath);

  if (files.length === 0) {
    console.error('No files found in the selected directory!');
    return;
  }

  console.log(`Found ${files.length} files to process`);
  console.log();

  // Confirm generation
  const { confirm } = await inquirer.prompt([
    {
      type: 'list',
      name: 'confirm',
      message: `Generate PDF with ${files.length} files?`,
      choices: [
        { name: 'Yes, generate PDF', value: true },
        { name: 'No, go back', value: false }
      ],
      loop: false
    }
  ]);

  if (!confirm) {
    console.log();
    return main(); // Restart from beginning
  }

  // Ask for PDF filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const defaultName = `${pathLabel.replace(/[/\\]/g, '_')}_${timestamp}`;
  
  const { pdfName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'pdfName',
      message: 'Enter PDF filename (without .pdf extension):',
      default: defaultName,
      validate: (input) => {
        if (!input) return 'Please enter a filename';
        if (input.includes('/') || input.includes('\\')) return 'Invalid characters in filename';
        return true;
      }
    }
  ]);

  const outputFileName = `${pdfName}.pdf`;

  console.log();
  console.log('Generating PDF... This may take a while.');
  console.log();

  try {
    await generatePDF(files, selectedPath, outputFileName, repoPath, selectedRepo);
    console.log();
    console.log('='.repeat(60));
    console.log('✓ Process completed successfully!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// Run the script
main().catch(console.error);

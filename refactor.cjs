const fs = require('fs');
const path = require('path');

const DIRS = [
  'src/components/Dashboard',
  'src/components/Views',
  'src/components/UI'
];

const REPLACEMENTS = [
  // Backgrounds
  { search: /(?<=\s|["'`])bg-\[\#0B0F19\](?=\s|["'`])/g, replace: 'bg-gray-50 dark:bg-[#0B0F19]' },
  { search: /(?<=\s|["'`])bg-\[\#111827\](?=\s|["'`])/g, replace: 'bg-white dark:bg-[#111827]' },
  { search: /(?<=\s|["'`])bg-white\/5(?=\s|["'`])/g, replace: 'bg-gray-100 dark:bg-white/5' },
  { search: /(?<=\s|["'`])bg-white\/10(?=\s|["'`])/g, replace: 'bg-gray-200 dark:bg-white/10' },
  { search: /(?<=\s|["'`])hover:bg-white\/10(?=\s|["'`])/g, replace: 'hover:bg-gray-200 dark:hover:bg-white/10' },
  { search: /(?<=\s|["'`])hover:bg-white\/5(?=\s|["'`])/g, replace: 'hover:bg-gray-100 dark:hover:bg-white/5' },
  
  // Text
  { search: /(?<=\s|["'`])text-white(?=\s|["'`])/g, replace: 'text-gray-900 dark:text-white' },
  { search: /(?<=\s|["'`])text-gray-300(?=\s|["'`])/g, replace: 'text-gray-700 dark:text-gray-300' },
  { search: /(?<=\s|["'`])text-gray-400(?=\s|["'`])/g, replace: 'text-gray-500 dark:text-gray-400' },
  { search: /(?<=\s|["'`])hover:text-white(?=\s|["'`])/g, replace: 'hover:text-gray-900 dark:hover:text-white' },
  
  // Borders
  { search: /(?<=\s|["'`])border-white\/5(?=\s|["'`])/g, replace: 'border-gray-200 dark:border-white/5' },
  { search: /(?<=\s|["'`])border-white\/10(?=\s|["'`])/g, replace: 'border-gray-200 dark:border-white/10' },
  { search: /(?<=\s|["'`])border-white\/20(?=\s|["'`])/g, replace: 'border-gray-300 dark:border-white/20' }
];

function processDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const req of REPLACEMENTS) {
        content = content.replace(req.search, req.replace);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

for (const dir of DIRS) {
  processDir(path.join(__dirname, dir));
}
console.log('Refactoring complete.');

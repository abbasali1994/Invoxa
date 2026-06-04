const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

const tsxFiles = getFiles('src').filter(file => file.endsWith('.tsx'));
const over100 = [];

for (const file of tsxFiles) {
  // Ignore src/components/ui/
  if (file.replace(/\\/g, '/').includes('src/components/ui/')) continue;

  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n').length;
  if (lines > 100) {
    over100.push({ file, lines });
  }
}

over100.sort((a, b) => b.lines - a.lines);
if (over100.length > 0) {
  console.log("Files over 100 lines:");
  for (const { file, lines } of over100) {
    console.log(`${lines} lines - ${file}`);
  }
} else {
  console.log("Success: Zero files over 100 lines!");
}

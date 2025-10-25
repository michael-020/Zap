import { BuildStep, BuildStepType, statusType } from '@/stores/editorStore/types';

const uuidv4 = () => crypto.randomUUID();

/*
 * Parse input XML and convert it into steps.
 * Eg: Input - 
 * <zapArtifeact id=\"project-import\" title=\"Project Files\">
 *  <zapAction type=\"file\" filePath=\"eslint.config.js\">
 *      import js from '@eslint/js';\nimport globals from 'globals';\n
 *  </zapAction>
 * <zapAction type="shell">
 *      node index.js
 * </zapAction>
 * </zapArtifeact>
 * 
 * Output - 
 * [{
 *      title: "Project Files",
 *      status: "Pending"
 * }, {
 *      title: "Create eslint.config.js",
 *      type: StepType.CreateFile,
 *      code: "import js from '@eslint/js';\nimport globals from 'globals';\n"
 * }, {
 *      title: "Run command",
 *      code: "node index.js",
 *      type: StepType.RunScript
 * }]
 * 
 * The input can have strings in the middle they need to be ignored
 */

export function getTitleFromFile(fileName: string): string {
  if (fileName === 'eslint.config.js') return 'Setup ESLint config';
  if (fileName === 'tailwind.config.js') return 'Configure Tailwind CSS';
  if (fileName === 'vite.config.ts') return 'Setup Vite config';
  if (fileName === 'package.json') return 'Create package.json';
  if (fileName.endsWith('.html')) return `Create ${fileName}`;
  if (fileName.endsWith('.tsx')) return `Create React Component ${fileName}`;
  if (fileName.endsWith('.css')) return `Create CSS Stylesheet`;
  return `Create ${fileName}`;
}

export function getDescriptionFromFile(fileName: string): string {
  if (fileName === 'eslint.config.js') return 'Defines ESLint rules and plugins for code quality.';
  if (fileName === 'tailwind.config.js') return 'Customizes Tailwind utility classes.';
  if (fileName === 'vite.config.ts') return 'Configuration file for Vite build tool.';
  if (fileName === 'package.json') return 'Specifies project dependencies and scripts.';
  if (fileName.endsWith('.tsx')) return 'React component file.';
  if (fileName.endsWith('.html')) return 'HTML entry point for the app.';
  if (fileName.endsWith('.css')) return 'Global styles for the application.';
  return 'Create a project file.';
}

export function parseXml(response: string): BuildStep[] {
  const xmlMatch = response.match(/<zapArtifeact[^>]*>([\s\S]*?)<\/zapArtifeact>/);
  if (!xmlMatch) return [];

  const xmlContent = xmlMatch[1];
  const steps: BuildStep[] = [];

  const titleMatch = response.match(/title="([^"]*)"/);
  const artifactTitle = titleMatch ? titleMatch[1] : 'Project Files';

  steps.push({
    id: uuidv4(),
    title: artifactTitle,
    description: 'Initialize project folder structure and setup files',
    type: BuildStepType.NonExecutuable,
    status: statusType.Pending,
    shouldExecute: false
  });

  const actionRegex = /<zapAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/zapAction>/g;
  
  let match;
  while ((match = actionRegex.exec(xmlContent)) !== null) {
    const [, type, filePath, content] = match;
    const code = content.trim();

    if (type === 'file') {
      const fileName = filePath?.split('/').pop() ?? 'file';

      const description = getDescriptionFromFile(fileName);
      const title = getTitleFromFile(fileName);
      const stepType = BuildStepType.CreateFile;

      steps.push({
        id: uuidv4(),
        title,
        description,
        type: stepType,
        status: statusType.Pending,
        code,
        path: filePath,
      });
    } else if (type === 'shell') {
      steps.push({
        id: uuidv4(),
        title: 'Run shell command',
        description: code,
        type: BuildStepType.RunScript,
        status: statusType.Pending,
        code,
      });
    }
  }

  return steps;
}
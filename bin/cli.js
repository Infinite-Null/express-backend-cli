#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  generatePackageJson, 
  generateServerJs, 
  generateDbConfig, 
  generateLoggerConfig, 
  generateMorganConfig, 
  generateErrorHandler, 
  generateResponseTemplate, 
  generateTestController, 
  generateTestRoutes, 
  generateGitignore, 
  generateReadme, 
  generateEnvExample, 
  generateEslintConfig 
} from '../lib/generators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .name('create-node-api')
  .description('Generate a Node.js Express API template with customizable features')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName) => {
    console.log(chalk.blue.bold('\n🚀 Welcome to Node.js Express API Template Generator!\n'));

    // Get project name if not provided
    if (!projectName) {
      const nameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          validate: (input) => {
            if (!input.trim()) {
              return 'Project name is required!';
            }
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores!';
            }
            return true;
          }
        }
      ]);
      projectName = nameAnswer.projectName;
    }

    // Interactive configuration
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useMongoDB',
        message: 'Do you want to use MongoDB?',
        default: true
      },
      {
        type: 'confirm',
        name: 'useLogger',
        message: 'Do you want to use Winston logger? (Recommended)',
        default: true
      },
      {
        type: 'confirm',
        name: 'useMorganLogging',
        message: 'Do you want to use Morgan HTTP request logging? (Recommended)',
        default: true,
        when: (answers) => answers.useLogger
      },
      {
        type: 'confirm',
        name: 'useErrorHandler',
        message: 'Do you want to include error handling middleware? (Recommended)',
        default: true
      },
      {
        type: 'confirm',
        name: 'useCORS',
        message: 'Do you want to enable CORS? (Recommended)',
        default: true
      },
      {
        type: 'input',
        name: 'serviceName',
        message: 'What is your service name? (used in logs)',
        default: projectName,
        validate: (input) => input.trim() ? true : 'Service name is required!'
      },
      {
        type: 'input',
        name: 'defaultPort',
        message: 'What default port should the server use?',
        default: '3001',
        validate: (input) => {
          const port = parseInt(input);
          if (isNaN(port) || port < 1 || port > 65535) {
            return 'Please enter a valid port number (1-65535)!';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'apiVersion',
        message: 'What API version do you want to use?',
        default: 'v1',
        validate: (input) => input.trim() ? true : 'API version is required!'
      },
      {
        type: 'confirm',
        name: 'createGitignore',
        message: 'Do you want to create a .gitignore file?',
        default: true
      },
      {
        type: 'confirm',
        name: 'createReadme',
        message: 'Do you want to create a README.md file?',
        default: true
      }
    ]);

    try {
      await generateProject(projectName, answers);
      console.log(chalk.green.bold(`\n✅ Project "${projectName}" created successfully!\n`));
      console.log(chalk.yellow('Next steps:'));
      console.log(chalk.white(`  1. cd ${projectName}`));
      console.log(chalk.white('  2. npm install'));
      console.log(chalk.white('  3. Create a .env file use the reference of `.env.example` (important!)'));
      console.log(chalk.white(`  ${answers.useMongoDB ? '4' : '3'}. npm start`));
      console.log(chalk.blue('\nHappy coding! 🎉\n'));
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Error creating project:'), error.message);
      process.exit(1);
    }
  });

async function generateProject(projectName, config) {
  const projectPath = path.join(process.cwd(), projectName);
  
  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory "${projectName}" already exists!`);
  }

  // Create project directory structure
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'config'));
  await fs.ensureDir(path.join(projectPath, 'controller'));
  await fs.ensureDir(path.join(projectPath, 'middleware'));
  await fs.ensureDir(path.join(projectPath, 'routes'));
  await fs.ensureDir(path.join(projectPath, 'template'));

  // Generate package.json
  await generatePackageJson(projectPath, projectName, config);

  // Generate server.js
  await generateServerJs(projectPath, config);

  // Generate configuration files
  if (config.useMongoDB) {
    await generateDbConfig(projectPath);
  }
  
  if (config.useLogger) {
    await generateLoggerConfig(projectPath, config.serviceName);
    
    if (config.useMorganLogging) {
      await generateMorganConfig(projectPath);
    }
  }

  // Generate middleware
  if (config.useErrorHandler) {
    await generateErrorHandler(projectPath, config.useLogger);
  }

  // Generate template files
  await generateResponseTemplate(projectPath);

  // Generate routes and controllers
  await generateTestController(projectPath, config.useErrorHandler);
  await generateTestRoutes(projectPath);

  // Generate additional files
  if (config.createGitignore) {
    await generateGitignore(projectPath);
  }

  if (config.createReadme) {
    await generateReadme(projectPath, projectName, config);
  }

  await generateEnvExample(projectPath, config);
  await generateEslintConfig(projectPath);
}

program.parse();

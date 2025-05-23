# Setup Guide for Node.js Express Template CLI

This guide will help you set up and publish your CLI tool to npm.

## 📁 Project Structure

Create the following directory structure for your CLI project:

```
node-express-backend-cli/
├── bin/
│   └── cli.js              # Main CLI executable
├── lib/
│   └── generators.js       # File generation functions
├── scripts/
│   └── install.sh          # Installation script
├── package.json            # Package configuration
├── README.md               # Main documentation
├── SETUP.md               # This setup guide
└── .gitignore             # Git ignore file
```

## 🛠️ Development Setup

### 1. Initialize the Project

```bash
mkdir node-express-backend-cli
cd node-express-backend-cli
npm init -y
```

### 2. Install Dependencies

```bash
npm install inquirer chalk fs-extra commander
```

### 3. Create the Files

Copy the provided files into their respective directories:

- `bin/cli.js` - Main CLI script
- `lib/generators.js` - File generation functions
- `package.json` - Update with the provided configuration

### 4. Make CLI Executable

```bash
chmod +x bin/cli.js
```

### 5. Link for Local Testing

```bash
npm link
```

Now you can test your CLI locally:

```bash
create-node-api test-project
```

## 📦 Publishing to npm

### 1. Create an npm Account

If you don't have an npm account:

1. Visit [npmjs.com](https://www.npmjs.com)
2. Sign up for an account
3. Verify your email

### 2. Login to npm

```bash
npm login
```

### 3. Update Package Information

Edit your `package.json`:

```json
{
  "name": "your-unique-cli-name",
  "version": "1.0.0",
  "description": "Your CLI description",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/your-cli-repo.git"
  },
  "homepage": "https://github.com/yourusername/your-cli-repo#readme",
  "bugs": {
    "url": "https://github.com/yourusername/your-cli-repo/issues"
  }
}
```

### 4. Check Package Name Availability

```bash
npm view your-unique-cli-name
```

If it returns an error, the name is available.

### 5. Publish to npm

```bash
npm publish
```

### 6. Test Installation

```bash
npm install -g your-unique-cli-name
your-cli-command --help
```

## 🔄 Updating Your CLI

When you make changes:

1. Update the version in `package.json`:

   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Publish the update:
   ```bash
   npm publish
   ```

## 🎯 CLI Command Examples

Your users will be able to install and use your CLI like this:

```bash
# Install globally
npm install -g your-unique-cli-name

# Use the CLI
your-cli-command my-new-project

# Get help
your-cli-command --help
```

## 📋 Checklist Before Publishing

- [ ] Test the CLI locally with `npm link`
- [ ] Ensure all file paths are correct
- [ ] Update package.json with correct information
- [ ] Create a comprehensive README.md
- [ ] Test generated projects work correctly
- [ ] Check that all dependencies are listed in package.json
- [ ] Verify the CLI works on different operating systems
- [ ] Add proper error handling
- [ ] Include usage examples in documentation

## 🐛 Troubleshooting

### Permission Issues on Linux/Mac

If you get permission errors:

```bash
sudo npm install -g your-cli-name
```

### CLI Not Found After Installation

Check npm global bin directory:

```bash
npm config get prefix
```

Add to PATH if needed:

```bash
export PATH=$PATH:$(npm config get prefix)/bin
```

### File Generation Errors

- Ensure all import paths are correct
- Check that generators.js exports all functions
- Verify file permissions for created directories

## 🚀 Advanced Features to Consider

1. **Update Notifier**: Notify users when a new version is available
2. **Templates**: Support multiple project templates
3. **Plugins**: Allow extending functionality with plugins
4. **Configuration File**: Support for CLI configuration files
5. **Validation**: More robust input validation
6. **Testing**: Add unit tests for your generators
7. **CI/CD**: Set up automated testing and publishing

## 📚 Resources

- [npm CLI Documentation](https://docs.npmjs.com/cli)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [Inquirer.js Documentation](https://github.com/SBoudrias/Inquirer.js)
- [Chalk Documentation](https://github.com/chalk/chalk)

## 🤝 Community

Consider creating:

- GitHub repository with issues and discussions
- Documentation website
- Discord/Slack community
- Contributing guidelines
- Code of conduct

Good luck with your CLI tool! 🎉

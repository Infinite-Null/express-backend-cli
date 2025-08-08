# Node.js Express Template CLI

A powerful command-line interface tool for generating Node.js Express API templates with customizable features. This CLI helps you quickly scaffold a professional Node.js API project with best practices and commonly used middleware.

## 📋 Usage

Generate a new Node.js Express API project:

```bash
npx express-backend-cli [project-name]
```

If you don't provide a project name, the CLI will prompt you for one.

### Interactive Setup

The CLI will ask you several questions to customize your project:

- **Project Name**: Name of your project directory
- **MongoDB Integration**: Include MongoDB connection with Mongoose
- **Winston Logger**: Include Winston logging system
- **Morgan HTTP Logging**: Include HTTP request logging (requires Winston)
- **Error Handler**: Include global error handling middleware
- **CORS**: Enable Cross-Origin Resource Sharing
- **Service Name**: Used in log messages (defaults to project name)
- **Default Port**: Server port (default: 3001)
- **API Version**: API versioning (default: v1)
- **Create .gitignore**: Generate .gitignore file
- **Create README**: Generate project README file

## 🎯 Features

The generated template includes:

### Core Features

- ✅ Express.js server setup
- ✅ Environment configuration with dotenv
- ✅ Modular project structure
- ✅ ESLint configuration
- ✅ Standardized API response format

### Optional Features

- 🗄️ **MongoDB**: Database integration with Mongoose
- 📊 **Logging**: Winston logger with custom formatting
- 📝 **HTTP Logging**: Morgan middleware for request logging
- 🛡️ **Error Handling**: Global error handling with async wrapper
- 🌐 **CORS**: Cross-Origin Resource Sharing support
- 📁 **Git Ready**: .gitignore and README files

## 📁 Generated Project Structure

```
your-project/
├── config/
│   ├── db.js           # MongoDB connection (optional)
│   ├── logger.js       # Winston logger (optional)
│   └── morgan.js       # Morgan HTTP logging (optional)
├── controller/
│   └── test.js         # Sample controller
├── middleware/
│   └── error-handler.js # Error handling middleware (optional)
├── routes/
│   └── test.js         # Sample routes
├── template/
│   └── response.js     # Standardized response format
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore file (optional)
├── eslint.config.js    # ESLint configuration
├── package.json        # Project dependencies and scripts
├── README.md           # Project documentation (optional)
└── server.js           # Main server file
```

## 🔧 Getting Started with Generated Project

After generating your project:

1. **Navigate to project directory:**

   ```bash
   cd your-project-name
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration

4. **Start development server:**

   ```bash
   npm run dev
   ```

5. **Test the API:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/test/hello
   ```

## 📝 Example Usage

```bash
# Generate a project with interactive setup
create-node-api my-awesome-api

# Generate a project with a specific name
create-node-api ecommerce-backend
```

## 🎨 Generated API Features

### Sample Endpoint

- **POST** `/api/v1/test/hello`
  - Returns: `{ "message": "Hello World! Your API is working correctly." }`

### Response Format

All API responses follow a standardized format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": "Optional data"
}
```

### Error Handling

If error handling is enabled, the template includes:

- Global error handler middleware
- Async error wrapper
- MongoDB-specific error handling
- Custom error support

### Logging

If logging is enabled, the template includes:

- Structured logging with Winston
- HTTP request logging with Morgan
- Colorized console output
- Error stack trace logging

## 🔧 Development

To contribute to this CLI tool:

```bash
# Clone the repository
git clone https://github.com/infinite-null/express-backend-cli.git

# Install dependencies
cd express-backend-cli
npm install

# Link for local development
npm link

# Test the CLI
create-node-api test-project
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you find any bugs or have feature requests, please open an issue on GitHub.

## 📞 Support

For help and support, please open an issue on the GitHub repository.

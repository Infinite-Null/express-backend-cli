import fs from "fs-extra";
import path from "path";

export async function generatePackageJson(projectPath, projectName, config) {
  const dependencies = {
    express: "^4.18.2",
    dotenv: "^16.3.1",
  };

  const devDependencies = {
    nodemon: "^3.0.1",
  };

  if (config.useMongoDB) {
    dependencies.mongoose = "^7.5.0";
  }

  if (config.useLogger) {
    dependencies.winston = "^3.10.0";
  }

  if (config.useMorganLogging && config.useLogger) {
    dependencies.morgan = "^1.10.0";
  }

  if (config.useCORS) {
    dependencies.cors = "^2.8.5";
  }

  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "Node.js Express API generated with express-backend-cli",
    main: "server.js",
    type: "module",
    scripts: {
      start: "node server.js",
      dev: "nodemon server.js",
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: ["nodejs", "express", "api"],
    author: "",
    license: "ISC",
    dependencies,
    devDependencies,
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageJson, {
    spaces: 2,
  });
}

export async function generateServerJs(projectPath, config) {
  let imports = `/**
 * Express server.
 * @module server
 */
import dotenv from 'dotenv';
import express from 'express';
`;

  let middlewares = `/**
 * Express application instance.
 * @type {express.Application}
 */
const app = express();

// Configurations.
dotenv.config();
app.use(express.json());
`;

  let routes = "";
  let errorHandling = "";
  let serverStart = "";

  // Add imports based on configuration
  if (config.useCORS) {
    imports += `import cors from 'cors';\n`;
    middlewares += `app.use(cors({ origin: '*' }));\n`;
  }

  if (config.useMongoDB) {
    imports += `import { connectDB } from './config/db.js';\n`;
  }

  if (config.useLogger) {
    imports += `import logger from './config/logger.js';\n`;

    if (config.useMorganLogging) {
      imports += `import morganMiddleware from './config/morgan.js';\n`;
      middlewares += `\n// Morgan logging middleware\napp.use(morganMiddleware);\n`;
    }
  }

  if (config.useErrorHandler) {
    imports += `import { errorHandler } from './middleware/error-handler.js';\n`;
  }

  imports += `import testRouter from './routes/test.js';
import response from './template/response.js';
`;

  middlewares += `
const PORT = process.env.PORT || ${config.defaultPort};
const BASE_URL = process.env.BASE_URL || 'http://localhost:';
`;

  routes = `
// Routes.
const namespace = '/api/${config.apiVersion}/test';
app.use(namespace, testRouter);

app.use((_, res) => {
    return response(
        res,
        false,
        404,
        '404 not found!'
    );
});
`;

  if (config.useErrorHandler) {
    errorHandling = `
// Error Handler (Should be last).
app.use(errorHandler);
`;
  }

  if (config.useMongoDB && config.useLogger) {
    serverStart = `
/**
 * Start the Express server on the specified port.
 * @listens {number} PORT - The port number the server is listening on
 */
app.listen(PORT)
    .on('error', (error) => {
        logger.error(error.message);
        process.exit(1);
    })
    .on('listening', async () => {
        try {
            await connectDB();
            logger.info(\`Service is running on port: \${PORT}\`);
            logger.info(\`Base URL: \${BASE_URL + PORT}\`);
        } catch (error) {
            logger.error(\`Failed to connect to DB: "\${error.message || error}"\`);
            process.exit(1);
        }
    });`;
  } else if (config.useMongoDB) {
    serverStart = `
/**
 * Start the Express server on the specified port.
 * @listens {number} PORT - The port number the server is listening on
 */
app.listen(PORT)
    .on('error', (error) => {
        console.error('Server error:', error.message);
        process.exit(1);
    })
    .on('listening', async () => {
        try {
            await connectDB();
            console.log(\`Service is running on port: \${PORT}\`);
            console.log(\`Base URL: \${BASE_URL + PORT}\`);
        } catch (error) {
            console.error(\`Failed to connect to DB: "\${error.message || error}"\`);
            process.exit(1);
        }
    });`;
  } else if (config.useLogger) {
    serverStart = `
/**
 * Start the Express server on the specified port.
 * @listens {number} PORT - The port number the server is listening on
 */
app.listen(PORT, () => {
    logger.info(\`Service is running on port: \${PORT}\`);
    logger.info(\`Base URL: \${BASE_URL + PORT}\`);
});`;
  } else {
    serverStart = `
/**
 * Start the Express server on the specified port.
 * @listens {number} PORT - The port number the server is listening on
 */
app.listen(PORT, () => {
    console.log(\`Service is running on port: \${PORT}\`);
    console.log(\`Base URL: \${BASE_URL + PORT}\`);
});`;
  }

  const serverContent =
    imports + "\n" + middlewares + routes + errorHandling + serverStart;

  await fs.writeFile(path.join(projectPath, "server.js"), serverContent);
}

export async function generateDbConfig(projectPath) {
  const dbContent = `/**
 * MongoDB connection module
 * @module db
 */

import mongoose from 'mongoose';

import logger from '../config/logger.js';

/**
 * Connects to a MongoDB database using Mongoose.
 *
 * Attempts to establish a connection using the \`DATABASE_URL\` environment variable.
 *
 * @returns {Promise<void>} Resolves when the connection is successfully established.
 * @throws {Error} If the \`DATABASE_URL\` environment variable is missing or if the connection attempt fails.
 */
async function connectDB() {
    if (!process.env.DATABASE_URL) {
        throw Error('Please provide Database URI');
    }

    await mongoose.connect(process.env.DATABASE_URL);
    logger.info('Database connected successfully');
}

export { connectDB };`;

  await fs.writeFile(path.join(projectPath, "config", "db.js"), dbContent);
}

export async function generateLoggerConfig(projectPath, serviceName) {
  const loggerContent = `import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize, errors, json } = format;

const SERVICE_NAME = "${serviceName}";

/**
 * Configuration for console logging format using Winston
 * Combines multiple formatting options for log output
 *
 * @constant
 * @type {import('winston').Logform.Format}
 * @property {Function} colorize - Adds colors to log output
 * @property {Function} timestamp - Adds timestamp in YYYY-MM-DD HH:mm:ss format
 * @property {Function} errors - Handles error stack traces
 * @property {Function} printf - Custom formatter that outputs:
 *    - Timestamp
 *    - Log level
 *    - Service name
 *    - Message
 *    - Stack trace (if error)
 *    - Additional metadata as JSON string (if present)
 * @returns {string} Formatted log string
 */
const consoleFormat = combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ timestamp, level, message, stack, ...meta }) => {
        delete meta.service;

        return stack
            ? \`[\${timestamp}] \${level}: \${SERVICE_NAME} - \${message}\\n\${stack}\`
            : \`[\${timestamp}] \${level}: \${SERVICE_NAME} - \${message} \${
                Object.keys(meta).length ? JSON.stringify(meta) : ""
            }\`;
    })
);

const logger = createLogger({
    level: "info",
    format: combine(timestamp(), errors({ stack: true }), json()),
    defaultMeta: { service: SERVICE_NAME },
    transports: [
        new transports.Console({
            format: consoleFormat,
            stderrLevels: ["error"],
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});

export default logger;`;

  await fs.writeFile(
    path.join(projectPath, "config", "logger.js"),
    loggerContent
  );
}

export async function generateMorganConfig(projectPath) {
  const morganContent = `/**
 * Morgan logging configuration
 * @module morgan
 */

import morgan from 'morgan';

import logger from './logger.js';

const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

/**
 * Morgan middleware configuration
 * Integrates with existing logger system
 */
const morganMiddleware = morgan(morganFormat, {
    stream: {
        write: (message) => {
            logger.info(message.trim());
        }
    }
});

export default morganMiddleware;`;

  await fs.writeFile(
    path.join(projectPath, "config", "morgan.js"),
    morganContent
  );
}

export async function generateErrorHandler(projectPath, useLogger) {
  const errorHandlerContent = `${
    useLogger ? "import logger from '../config/logger.js';" : ""
  }
import response from '../template/response.js';

/**
 * Global error handler middleware
 */
const errorHandler = (err, _req, res, _next) => {
    ${useLogger ? "logger.error(err);" : "console.error(err);"}
    let message = 'Something went wrong!';
    let statusCode = 500;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(err => err.message);
        
        if (messages.length > 0) {
            message = messages[0];
        }
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        message = \`Duplicate value entered for \${Object.keys(
            err.keyValue
        )} field, please use another value\`;
    }

    // Mongoose cast error (invalid ID)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = "Invalid ID!";
    }
    
    const { statusCode: customStatusCode, message: customMessage } = err;
    
    // Custom defined errors
    if (customStatusCode) {
        statusCode = customStatusCode;
        message = customMessage;
    }

    return response(
        res,
        false,
        statusCode,
        message
    );
};

/**
 * Async error handler wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export {
    asyncHandler, errorHandler
};`;

  await fs.writeFile(
    path.join(projectPath, "middleware", "error-handler.js"),
    errorHandlerContent
  );
}

export async function generateResponseTemplate(projectPath) {
  const responseContent = `/**
 * Utility function to send standardized JSON responses
 *
 * @module template/response
 *
 * @param {object} res - Express response object (REQUIRED)
 * @param {boolean} [success=true] - Indicates if the request was successful
 * @param {number} [statusCode=200] - HTTP status code for the response
 * @param {string} [message] - Optional response message to be sent to the client
 * @param {*} [data] - Optional data to be included in the response
 * @returns {object} Express response object with formatted JSON
 *
 * @description
 * This function creates a standardized response format for all API endpoints.
 * Only the 'success' property is always included. The 'message' and 'data'
 * properties are only added to the response when provided (non-null/undefined).
 *
 * @example
 * // Success response with message and data
 * response(res, true, 200, "User created successfully", { userId: "123" });
 * // Returns: { "success": true, "message": "User created successfully", "data": { "userId": "123" } }
 *
 * @example
 * // Error response with only message
 * response(res, false, 400, "Invalid input parameters");
 * // Returns: { "success": false, "message": "Invalid input parameters" }
 *
 * @example
 * // Minimal response with only success flag
 * response(res);
 * // Returns: { "success": true }
 */
export default function response(res, success = true, statusCode = 200, message, data) {
    const result = { success };

    if (message) result.message = message;
    if (data) result.data = data;

    return res.status(statusCode).json(result);
}`;

  await fs.writeFile(
    path.join(projectPath, "template", "response.js"),
    responseContent
  );
}

export async function generateTestController(projectPath, useErrorHandler) {
  const controllerContent = `/**
 * test controller module
 * Contains all test-related controller functions
 * @module controller/test
 */
${
  useErrorHandler
    ? "import { asyncHandler } from '../middleware/error-handler.js';"
    : ""
}

/**
 * Test controller for test functionality
 * @route POST /api/v1/test/hello
 * @access Public
 * @description Test endpoint that returns a hello message
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with hello message
 */
const testController = ${useErrorHandler ? "asyncHandler(" : ""}(req, res) => {
    res.status(200).json({
        message: 'Hello World! Your API is working correctly.'
    });
}${useErrorHandler ? ")" : ""};

export { testController };`;

  await fs.writeFile(
    path.join(projectPath, "controller", "test.js"),
    controllerContent
  );
}

export async function generateTestRoutes(projectPath) {
  const routesContent = `/**
 * test routes module
 * Handles all test-related API endpoints
 * @module routes/test
 */
import express from 'express';

import { testController } from '../controller/test.js';

/**
 * Express router instance for routes
 * @type {express.Router}
 */
const testRoute = express.Router();

/**
 * Test endpoint for test functionality
 * @route POST /hello
 * @access Public
 * @description Test route for test operations
 */
testRoute.post('/hello', testController);

export default testRoute;`;

  await fs.writeFile(
    path.join(projectPath, "routes", "test.js"),
    routesContent
  );
}

export async function generateGitignore(projectPath) {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`;

  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignoreContent);
}

export async function generateReadme(projectPath, projectName, config) {
  const readmeContent = `# ${projectName}

Node.js Express API generated with express-backend-cli

## Features

- ✅ Express.js server
${config.useMongoDB ? "- ✅ MongoDB integration with Mongoose" : ""}
${config.useLogger ? "- ✅ Winston logging" : ""}
${config.useMorganLogging ? "- ✅ HTTP request logging with Morgan" : ""}
${config.useErrorHandler ? "- ✅ Global error handling middleware" : ""}
${config.useCORS ? "- ✅ CORS enabled" : ""}
- ✅ Environment configuration with dotenv
- ✅ Standardized API response format

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
${config.useMongoDB ? "- MongoDB database" : ""}

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Configure your environment variables in \`.env\`${
    config.useMongoDB ? " (especially DATABASE_URL)" : ""
  }

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Or start the production server:
\`\`\`bash
npm start
\`\`\`

## API Endpoints

### Test Endpoint
- **POST** \`/api/${config.apiVersion}/test/hello\`
  - Description: Test endpoint to verify API is working
  - Response: \`{ "message": "Hello World! Your API is working correctly." }\`

## Project Structure

\`\`\`
${projectName}/
├── config/          # Configuration files
${config.useMongoDB ? "│   ├── db.js        # Database connection" : ""}
${config.useLogger ? "│   ├── logger.js    # Winston logger configuration" : ""}
${config.useMorganLogging ? "│   └── morgan.js    # Morgan HTTP logging" : ""}
├── controller/      # Route controllers
│   └── test.js
├── middleware/      # Custom middleware
${config.useErrorHandler ? "│   └── error-handler.js" : ""}
├── routes/          # API routes
│   └── test.js
├── template/        # Response templates
│   └── response.js
├── .env.example     # Environment variables example
├── package.json
└── server.js        # Main server file
\`\`\`

## Environment Variables

Create a \`.env\` file in the root directory with the following variables:

\`\`\`env
PORT=${config.defaultPort}
BASE_URL=http://localhost:
${
  config.useMongoDB
    ? "DATABASE_URL=mongodb://localhost:27017/your-database-name"
    : ""
}
\`\`\`

## Scripts

- \`npm start\` - Start the production server
- \`npm run dev\` - Start the development server with nodemon

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.`;

  await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
}

export async function generateEnvExample(projectPath, config) {
  const envContent = `# Server Configuration
PORT=${config.defaultPort}
BASE_URL=http://localhost:

${
  config.useMongoDB
    ? `# Database Configuration
DATABASE_URL=mongodb://localhost:27017/your-database-name

`
    : ""
}# Add your environment variables here`;

  await fs.writeFile(path.join(projectPath, ".env.example"), envContent);
}

export async function generateEslintConfig(projectPath) {
  const eslintContent = `export default [
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                exports: "writable",
                global: "readonly",
                module: "readonly",
                require: "readonly"
            }
        },
        rules: {
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "no-console": "off",
            "indent": ["error", 4],
            "quotes": ["error", "single"],
            "semi": ["error", "always"]
        }
    }
];`;

  await fs.writeFile(path.join(projectPath, "eslint.config.js"), eslintContent);
}

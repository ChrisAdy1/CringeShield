// This script runs before Vercel builds the project
// It detects whether we're in Vercel's preview deployment environment or production
// and sets NODE_ENV accordingly

const fs = require('fs');

// Check environment
const isProduction = process.env.VERCEL_ENV === 'production';
console.log(`Building for ${isProduction ? 'production' : 'development'} environment`);

// Set NODE_ENV for the build process
process.env.NODE_ENV = isProduction ? 'production' : 'development';

// You can add more Vercel-specific setup here if needed
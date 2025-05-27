# Use official Node.js image as the base
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock files
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Fix permissions for .next/cache
RUN mkdir -p .next/cache/images && chmod -R 777 .next/cache

# Expose port  3000
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "dev"]

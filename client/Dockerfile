# Stage 1: Build the React frontend
#FROM node:14 AS frontend

WORKDIR /my-finance-app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY client/package*.json ./
RUN npm install

# Copy the rest of the client application files
COPY client/ ./

# Build the React app
RUN npm run build

# Stage 2: Setup the server environment
#FROM node:14 AS backend

WORKDIR /my-finance-app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY server/package*.json ./
RUN npm install

# Copy the rest of the server application files
COPY server/ ./

# Expose the server port
EXPOSE 5000

# Command to run the server
CMD ["node", "index.js"]

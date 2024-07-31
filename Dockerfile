FROM node:16.16.0-alpine

ENV NODE_ENV production

WORKDIR /my-finance-app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY client/package*.json ./
RUN npm install

# Stage 1: Build the React frontend

# Change directory to client, install frontend dependencies and build
WORKDIR /my-finance-app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
RUN npm run build

# Stage 2: Setup the server environment
WORKDIR /my-finance-app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY server/package*.json ./
RUN npm install

# Expose the server port
EXPOSE 5000

# Command to run the server
#CMD ["node", "server/index.js"]

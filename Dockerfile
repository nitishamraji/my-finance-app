FROM node:16.16.0-alpine

ENV NODE_ENV production

#RUN ls -l /app

WORKDIR /app

# Copy package.json and package-lock.json (if exists) to install dependencies
COPY package*.json ./
#RUN npm install --legacy-peer-deps

# Stage 1: Build the React frontend

# Change directory to client, install frontend dependencies and build
WORKDIR /app/client
COPY . /app/client/
RUN npm install --legacy-peer-deps
RUN npm run build --verbose

# Stage 2: Setup the server environment
WORKDIR /app/server
COPY . /app/server/
RUN npm install --legacy-peer-deps

# Expose the server port
EXPOSE 5000

# Command to run the server
#CMD ["node", "server/index.js"]

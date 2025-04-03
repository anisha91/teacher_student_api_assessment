# Use the official Node.js image as base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install MySQL client
RUN apt-get update && apt-get install -y default-mysql-client

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Expose port for the API
EXPOSE 3000

# Run tests when the container is started
 CMD ["npm", "start"]

# Start the application
#CMD ["node", "server.js"]

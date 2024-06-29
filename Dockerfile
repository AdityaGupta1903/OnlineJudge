# Use an official Node.js runtime as the base image
FROM node:18
# Set the working directory in the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the container
COPY ./Backend/package*.json ./
# Install application dependencies
RUN npm install
# Copy the rest of the application code
COPY ./Backend .
# Specify the command to run your application

CMD ["npm", "run","RunSolution"]
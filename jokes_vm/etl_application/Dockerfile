FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the file from your host to your current location.
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle your app's source code inside the Docker image
COPY . .

# Define the command to run your app using CMD which defines your runtime
CMD [ "npm", "start" ]

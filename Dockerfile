FROM node:slim

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ARG POSTGRES_URL
ENV POSTGRES_URL=$POSTGRES_URL

# Install Chromium and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-freefont-ttf \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Set the environment variables
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
  PUPPETEER_USER_DATA_DIR=/tmp/puppeteer_user_data

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package*.json yarn.lock ./

# Install the dependencies
RUN yarn install

# Copy the rest of the application files to the container
COPY . .

# Expose the port on which your application will run
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]

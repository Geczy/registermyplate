FROM node:slim

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ARG POSTGRES_URL
ENV POSTGRES_URL=$POSTGRES_URL
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update
RUN apt-get install chromium -y
ENV HOME=/home/app-user
RUN useradd -m -d $HOME -s /bin/bash app-user
RUN mkdir -p $HOME/app

# Set the working directory inside the container
WORKDIR $HOME/app

# Copy package.json and yarn.lock to the container
COPY package*.json yarn.lock ./

RUN chown -R app-user:app-user $HOME
USER app-user

# Install the dependencies
RUN yarn install

# Copy the rest of the application files to the container
COPY . .

# Expose the port on which your application will run
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]

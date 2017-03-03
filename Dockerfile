FROM node:7.5.0

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app/
RUN npm install

# Bundle app source
COPY . /app
RUN echo $(date) > ./build.date

EXPOSE 3000

CMD [ "node", "server.js" ]

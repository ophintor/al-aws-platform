FROM node:7.5.0

RUN apt-get update && \
    apt-get install -y python-dev python-pip && \
    pip install --upgrade awscli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY scripts/entrypoint.sh /

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app/
RUN npm install --color=false --only=prod

# Bundle app source
COPY . /app
RUN echo $(date) > ./build.date

EXPOSE 3000

CMD [ "/entrypoint.sh", "node", "server.js" ]
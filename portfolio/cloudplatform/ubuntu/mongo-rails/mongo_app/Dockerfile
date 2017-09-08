# All databases stuff should be moved 'somewhere', ideally lambda.

FROM ruby:2.3

ARG PORT

RUN apt-get update && \
    apt-get install -y python-dev python-pip && \
    pip install --upgrade awscli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Bundle app source
COPY . /app
RUN echo $(date) > ./build.date

EXPOSE ${PORT}

CMD chmod +x scripts/*.sh; scripts/after_install.sh; scripts/app_start.sh

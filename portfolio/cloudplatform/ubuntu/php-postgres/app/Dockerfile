# All databases stuff should be moved 'somewhere', ideally lambda.

FROM ubuntu:16.04

ARG PORT

RUN apt-get update && \
    apt-get install -y curl python-dev python-pip php apache2 libapache2-mod-php php-pgsql postgresql-client && \
    pip install --upgrade awscli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Bundle app source
COPY . /app
RUN echo $(date) > ./build.date

EXPOSE ${PORT}

CMD bash /app/scripts/after_install.sh && /app/scripts/entrypoint.sh apachectl -DFOREGROUND

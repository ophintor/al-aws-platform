# All databases stuff should be moved 'somewhere', ideally lambda.

FROM python:2

ARG PORT

RUN apt-get update && \
    apt-get install -y python-dev python-pip ruby && \
    pip install --upgrade awscli neo4django py2neo httpie && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY scripts/entrypoint.sh scripts/init_db.sh public/* /

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Bundle app source
COPY . /app
RUN echo $(date) > ./build.date

EXPOSE ${PORT}

# CMD [ "/entrypoint.sh", "python", "/public/django/manage.py" ]
CMD scripts/container_start.sh

# All databases stuff should be moved 'somewhere', ideally lambda.

FROM openjdk:latest

ARG PORT

RUN apt-get update && \
    apt-get install -y python-dev python-pip mysql-client libmysql-java && \
    pip install --upgrade awscli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY scripts/entrypoint.sh /
COPY java-application/target/*.jar /

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Bundle app source
COPY . /app
RUN echo $(date) > ./build.date

EXPOSE ${PORT}

# CMD [ "/entrypoint.sh", "java" ]
CMD chmod u+x scripts/sql_schema.sh; /entrypoint.sh /app/scripts/sql_schema.sh; /entrypoint.sh java -jar /demo-0.0.1-SNAPSHOT.jar

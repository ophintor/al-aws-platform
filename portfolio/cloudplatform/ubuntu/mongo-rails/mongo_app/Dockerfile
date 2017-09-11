# All databases stuff should be moved 'somewhere', ideally lambda.

FROM ruby:2.3

ARG PORT

RUN apt-get update && \
    apt-get install -y python-dev python-pip node && \
    pip install --upgrade awscli && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY scripts/entrypoint.sh /

# Create mongo_app directory
RUN mkdir -p /mongo_app
WORKDIR /mongo_app

# Bundle mongo_app source
COPY . /mongo_app
RUN echo $(date) > ./build.date

EXPOSE ${PORT}

RUN bundle install
CMD chmod +x scripts/*.sh && scripts/entrypoint.sh scripts/start_app.sh

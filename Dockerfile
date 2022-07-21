FROM ruby:2.7.4-slim as ruby-base

# Default env vars (applies to containers made from this image)
# Can be overriden at run-time with -e
ENV APP_DIR=/app
# Sets the path to allow running bundler binstubs
ENV PATH="${PATH}:${APP_DIR}/bin"
ENV BUNDLE_PATH=/bundle/vendor
ENV NODE_VERSION 14.17.3
ENV YARN_VERSION 1.22.5

# Build args - shell variables assigned at build time.
# can be overridden at build time with --build-arg
ENV BUNDLER_VERSION=2.2.31
ENV RAILS_ENV=production
ENV BUNDLE_PATH=/bundle/vendor

# Here are the dependencies we need to build our app (and install Rails)
# This example installs the PostgreSQL and SQLite libraries (two commonly used databases in Rails apps).
#
# We're also installing the latest nodejs and yarn packages here for webpacker.
RUN apt-get update -qq && apt-get install -yq curl gnupg2 lsb-release python \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash \
    && curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && curl -sL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


RUN apt-get update -qq &&  apt-get install -yq build-essential git ruby-dev libpq-dev \
    postgresql-client-11 nodejs shared-mime-info imagemagick \
    && apt-get install -yq yarn \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN curl -sL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
      && echo 'deb http://dl.google.com/linux/chrome/deb/ stable main' >> /etc/apt/sources.list.d/google-chrome.list \
      && apt-get update -qq \
      && apt-get install -y --no-install-recommends google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 libxtst6 libx11-xcb1 \
      && rm /etc/apt/sources.list.d/google-chrome.list \
      && apt-get clean \
      && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


RUN gem update --system && gem install bundler -v $BUNDLER_VERSION

# This creates the APP_DIR that we defined earler
# and sets it as the default directory in the container created from this image
RUN mkdir ${APP_DIR}
WORKDIR ${APP_DIR}

#
# Here, we copy our gem and npm dependency files into our image.
# We do this here so that when we change dependencies and a rebuild is needed, we can
# leverage the build cache (everything above this point will not be rebuilt).
#
COPY Gemfile Gemfile.lock ./
RUN bundle check || (jobs="$(nproc)"; \
    set -x; \
    bundle config build.nokogiri --use-system-libraries \
    && bundle install --jobs "$jobs" --without development test)

COPY package.json yarn.lock .npmrc ./
RUN yarn install --pure-lockfile

# Copy all of our app in to the image (use .dockerignore to omit patterns)
COPY . ./

ARG DATABASE_URL="postgresql://dummy@dummy:5432/dummy"
ARG SECRET_KEY_BASE="dummy"
ARG ASSET_HOST=""
ARG NODE_OPTIONS="--max_old_space_size=8192"
ARG AWS_ACCESS_KEY_ID="dummy_key"
ARG AWS_SECRET_ACCESS_KEY="dummy_secret"
ARG AWS_REGION="eu-west-1"
ARG AWS_S3_BUCKET="dummy_bucket"

COPY config/database.yml.sample config/database.yml

RUN (DISABLE_COVERAGE=1 bundle exec rails webpacker:compile || DISABLE_COVERAGE=1 bundle exec rails webpacker:compile) \
    && WEBPACKER_PRECOMPILE=false DISABLE_COVERAGE=1 bundle exec rails assets:precompile \
    && rm -rf tmp/

# Declares that we intend to listen on port 3000. This is a declarative documentation instruction
# that doesn't actually publish or open a port.

# This gets executed when we run a container made from this image
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]

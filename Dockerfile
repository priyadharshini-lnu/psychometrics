FROM ruby:3.1.2-slim as ruby-base

# Default env vars (applies to containers made from this image)
# Can be overriden at run-time with -e
ENV APP_DIR="/app"
ENV PATH="${PATH}:${APP_DIR}/bin" \
    NODE_VERSION="18.16.1" \
    YARN_VERSION="1.22.5" \
    BUNDLER_VERSION="2.3.17" \
    RAILS_ENV="production" \
    BUNDLE_WITHOUT="development test"

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Here are the dependencies we need to build our app (and install Rails)
# This example installs the PostgreSQL and SQLite libraries (two commonly used databases in Rails apps).
#
# We're also installing the latest nodejs
RUN apt-get update -qq && apt-get install -yq --no-install-recommends curl gnupg2 lsb-release python \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash \
    && curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list \
    && curl -sL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


RUN apt-get update -qq &&  apt-get install -yq --no-install-recommends build-essential git ruby-dev libpq-dev \
    postgresql-client-11 nodejs shared-mime-info imagemagick libjemalloc2 \
    && apt-get install -yq yarn --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# RUN curl -sL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
#       && echo 'deb http://dl.google.com/linux/chrome/deb/ stable main' >> /etc/apt/sources.list.d/google-chrome.list \
#       && apt-get update -qq \
#       && apt-get install -y --no-install-recommends google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 libxtst6 libx11-xcb1 \
#       && rm /etc/apt/sources.list.d/google-chrome.list \
#       && apt-get clean \
#       && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN gem update --system && gem install bundler -v $BUNDLER_VERSION

# This creates the APP_DIR that we defined earler
# and sets it as the default directory in the container created from this image
RUN mkdir ${APP_DIR}
WORKDIR ${APP_DIR}



FROM ruby-base as ruby-gems
ENV APP_DIR=/app
ENV PATH="${PATH}:${APP_DIR}/bin"
ENV NODE_VERSION 18.16.1
ENV YARN_VERSION 1.22.5
ENV BUNDLER_VERSION=2.3.17
ENV RAILS_ENV=production
ENV BUNDLE_WITHOUT 'development test'

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN echo 'gem: --no-document' > ~/.gemrc

#
# Here, we copy our gem and npm dependency files into our image.
# We do this here so that when we change dependencies and a rebuild is needed, we can
# leverage the build cache (everything above this point will not be rebuilt).
#
COPY Gemfile Gemfile.lock ./
RUN bundle check || (jobs="$(nproc)"; \
    set -x; \
    bundle config build.nokogiri --use-system-libraries \
    && bundle install --jobs "$jobs" \
    && find /usr/local/bundle/ -name "*.gem" -delete)


FROM ruby-base as yarn-deps

ENV APP_DIR=/app
ENV PATH="${PATH}:${APP_DIR}/bin"
ENV NODE_VERSION 18.16.1
ENV YARN_VERSION 1.22.5
ENV BUNDLER_VERSION=2.3.17
ENV RAILS_ENV=production
ENV BUNDLE_WITHOUT 'development test'
ENV NODE_ENV=production

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN yarn global add modclean@3.0.0-beta.1

COPY package.json yarn.lock .npmrc ./
RUN yarn install --pure-lockfile && modclean -r


FROM ruby-base as bundle-assets

ENV APP_DIR=/app
ENV PATH="${PATH}:${APP_DIR}/bin"
ENV NODE_VERSION 18.16.1
ENV YARN_VERSION 1.22.5
ENV BUNDLER_VERSION=2.3.17
ENV RAILS_ENV=production
ENV NODE_ENV=production
ENV BUNDLE_WITHOUT='development test'
ENV THREAD_LOADER_WORKERS='3'

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

COPY --from=yarn-deps /app/node_modules /app/node_modules
COPY --from=ruby-gems /usr/local/bundle /usr/local/bundle
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
ARG S3_COMPATIBLE_STORAGE_ACCESS_KEY_ID="dummy"
ARG S3_COMPATIBLE_STORAGE_SECRET_ACCESS_KEY="dummy"
ARG S3_COMPATIBLE_STORAGE_REGION="dummy"
ARG S3_COMPATIBLE_STORAGE_PUBLIC_BUCKET="dummy"
ARG S3_COMPATIBLE_STORAGE_PRIVATE_BUCKET="dummy"
ARG S3_COMPATIBLE_STORAGE_PROVIDER="aws"

COPY config/database.yml.sample config/database.yml

RUN bundle exec rake i18n:js:export \
    && DISABLE_COVERAGE=1 bundle exec rails assets:precompile \
    && rm -rf tmp/ && rm -rf node_modules

FROM ruby:3.1.2-slim

ENV APP_DIR=/app
ENV PATH="${PATH}:${APP_DIR}/bin"
ENV NODE_VERSION 18.16.1
ENV YARN_VERSION 1.22.5
ENV BUNDLER_VERSION=2.3.17
ENV RAILS_ENV=production
ENV BUNDLE_WITHOUT 'development test'

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

COPY --from=ruby-base /usr/lib/x86_64-linux-gnu/libjemalloc.so.2 /usr/local/lib/
ENV LD_PRELOAD=/usr/local/lib/libjemalloc.so.2

RUN MALLOC_CONF=stats_print:true ruby -e "exit"

RUN apt-get update -qq && apt-get install -yq --no-install-recommends curl gnupg2 lsb-release \
    && curl -sL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update -qq &&  apt-get install -yq --no-install-recommends build-essential libpq-dev \
    postgresql-client-11 shared-mime-info imagemagick \
    && gem update --system && gem install bundler -v $BUNDLER_VERSION \
    && apt-get --purge remove build-essential libpq-dev -y -qq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


RUN mkdir ${APP_DIR}
WORKDIR ${APP_DIR}

COPY --from=bundle-assets /app/public/vite /app/public/vite
COPY --from=bundle-assets /app/public/assets /app/public/assets
COPY --from=ruby-gems /usr/local/bundle /usr/local/bundle

COPY . ./

COPY config/database.yml.sample config/database.yml

# This gets executed when we run a container made from this image
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]

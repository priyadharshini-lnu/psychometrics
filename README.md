# Psychometrics

[![pipeline status](https://gitlab.com/tte-lighthouse/psychometrics/badges/develop/pipeline.svg)](https://gitlab.com/tte-lighthouse/psychometrics/commits/develop)
[![coverage report](https://gitlab.com/tte-lighthouse/psychometrics/badges/develop/coverage.svg)](https://gitlab.com/tte-lighthouse/psychometrics/commits/develop)


## Requisites

Ruby version: 2.5.1

Rails version: 5.1.6

Bundler version: 1.15.2

Node version: 10.0.0

Database: PostgresSql

prevent bundle secure warnings with

``` bundle config github.https true ```

# Local Setup

0. Create a Gemset (optional)

    RVM: `$> rvm gemset create tte-psychometrics`
    rbenv: install [rbenv-gemset plugin](https://github.com/jf/rbenv-gemset) then in the project directory run `$> rbenv gemset create [version] [gemset]`

1. `$> bundle install`
2. `$> cp config/application.sample.yml config/application.yml`
3. `$> cp config/database.yml.example config/database.yml`
4. `$> cp config/settings/development.yml.example config/settings/development.yml`

    Uncomment and set values for `ENCRYPTED_KEY`, `SECRET_KEY_BASE` and `SECRET_TOKEN_FOR_GENERATE` in `application.yml`.

    Edit and setup `database.yml` as appropriate.

5. Create databases `$> bundle exec rake db:create`

    Ask for a DB dump to load in the local database from a team member. Follow instructions from [here](https://gist.github.com/rohanpujaris/f0bb37c293fefe89f39a9c840248e53a) to load data.

6. `$> npm instal l`

7. Install redis.
     For mac follow simple steps: `brew update`, `brew install redis`. For more information check redis-doc [here](https://redis.io/topics/quickstart)

# Run the application locally

0. Create a Super user to login (optional):
```
$> rails c
$> Users::SuperAdmin.create(
  email: 'email@gmail.com',
  password: 'Pass123$',
  first_name: 'FirstName',
  last_name: 'LastName'
)
```

1. Setup a loopback address to `lvh.me` or another preferred local domain
2. Run the server `bundle exec rails s -p 3030`
3. start redis server `brew services start redis` or `redis-server`
4. start webpack server with command `./bin/webpack-dev-server`. Check more details [here](https://github.com/rails/webpacker)
5. Visit https://lvh.me:3030


# SSL
Add the following environment variables. Use appropriate local development domains if not using `lvh.me`

```
WEBPACKER_DEV_SERVER_HTTPS="true"
WEBPACKER_DEV_SERVER_HOST="lvh.me"
WEBPACKER_DEV_SERVER_PUBLIC="lvh.me:3035"
```

1. Run the server

   `bundle exec rails s -p 3030 -b "ssl://0.0.0.0:3030?key=support/dev-ssl/lvh.me.key&cert=support/dev-ssl/lvh.me.pem"`
2. Visit https://lvh.me:3030

## Using other local domains with SSL
Example of using `psy.loc`

1. Generate SSL key and certificates using the [instructions](support/dev-ssl/steps.md)
2. Ensure the key is named `psy.loc.key` and certificate is named `psy.loc.pem`
3. Run the server with

   `bundle exec rails s -p 3030 -b "ssl://0.0.0.0:3030?key=support/dev-ssl/psy.loc.key&cert=support/dev-ssl/psy.loc.pem"`


# Run tests

1. `$> bundle exec rspec`
.
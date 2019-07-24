# Psychometrics

[![pipeline status](https://gitlab.com/tte-lighthouse/psychometrics/badges/develop/pipeline.svg)](https://gitlab.com/tte-lighthouse/psychometrics/commits/develop)
[![coverage report](https://gitlab.com/tte-lighthouse/psychometrics/badges/develop/coverage.svg)](https://gitlab.com/tte-lighthouse/psychometrics/commits/develop)


## Requisites

Ruby version: 2.5.1

Rails version: 5.1.6

Bundler version: 1.15.2

Database: PostgresSql

prevent bundle secure warnings with

``` bundle config github.https true ```

# Local Setup

0. Create a Gemset (optional) `$> rvm gemset create tte-psychometrics`
1. `$> bundle install`
2. `$> cp config/application.sample.yml config/application.yml`
3. `$> cp config/secrets.yml.sample config/secrets.yml`
4. `$> cp config/database.yml.example config/database.yml`
5. `$> cp config/settings/development.yml.example config/settings/development.yml`

> Uncomment and set values for `ENCRYPTED_KEY`, `SECRET_KEY_BASE` and `SECRET_TOKEN_FOR_GENERATE` in `application.yml`.

> Edit and setup `database.yml` as appropriate.

5. Create databases `$> bundle exec rake db:create`

> Ask for a DB dump to load in the local database from a team member. Follow instructions from [here](https://gist.github.com/rohanpujaris/f0bb37c293fefe89f39a9c840248e53a) to load data.

# Run the application locally

0. Create a Super user to login (optional):
```
$> rails c
$> Users::SuperAdmin.create(
  email: 'email',
  password: 'password',
  first_name: 'FirstName',
  last_name: 'LastName'
)
```
1. Setup a loopback address to `lvh.me`
2. Run the server `bundle exec rails s -p 3030`
3. Visit `lvh.me:3030`

# Run tests

1. `$> bundle exec rspec`

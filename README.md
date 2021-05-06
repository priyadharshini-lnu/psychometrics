# Psychometrics

<a href='https://tte.semaphoreci.com/badges/psychometrics/branches/develop.svg?style=shields&key=90a67bc4-d4d7-43f5-a946-e7fc990908fe'> <img src='https://tte.semaphoreci.com/badges/psychometrics/branches/develop.svg?style=shields&key=90a67bc4-d4d7-43f5-a946-e7fc990908fe' alt='Build Status'></a>

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
2. `$> cp config/application.yml.sample config/application.yml`
3. `$> cp config/database.yml.sample config/database.yml`
4. `$> cp config/settings/development.yml.sample config/settings/development.yml`

    Uncomment and set values for `ENCRYPTED_KEY`, `SECRET_KEY_BASE` and `SECRET_TOKEN_FOR_GENERATE` in `application.yml`.

    Edit and setup `database.yml` as appropriate.

5. Create databases `$> bundle exec rake db:create`

    Ask for a DB dump to load in the local database from a team member. Follow instructions from [here](https://gist.github.com/rohanpujaris/f0bb37c293fefe89f39a9c840248e53a) to load data.

6. `$> npm install`

7. Install redis.
     For mac follow simple steps: `brew update`, `brew install redis`. For more information check redis-doc [here](https://redis.io/topics/quickstart)
8. To generate report pdf locally clone [this repository](https://github.com/TheTalentEnterprise/serverless-url-to-pdf).
Follow the instruction mentioned in the README.md to install and run the serverless framework.
In the main psychometric repo set environment variable `URL_TO_PDF_LAMBDA_URL` to `http://localhost:3000/dev`

### Run PSQL through docker (optional)
> Due to supporting old PSQL version (11) on production we have to use the same version locally

```
docker run -d --name psy_postgres -e POSTGRES_HOST_AUTH_METHOD=trust -v /Users/<your_name>/psql_data/psy:/var/lib/postgresql/data -p 54321:5432 postgres:11
```
now you can connect `psql -h localhost -p 54321 -U postgres`

When docker container is stopped, use this command

```
docker start psy_postgres
```

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

# Reverse Proxy
Reverse proxy can be used to publicly expose local development environment to receive webhooks.

1. Set `domain` to `project458.com`
1. Set `subdomain` to `www`
1. Set `protocol` to `http`; SSL termination happens on the proxy server
1. Run rails server without SSL
1. Ensure your ssh public key is added in the proxy server
1. Start reverse proxy session by running `ssh -R 3030:localhost:3030 root@reverse-proxy.tte-work.com`

Following the above steps, your local development environment should be accessible via `https://www.project458.com`

# Run tests

```sh
bundle exec rspec
```

# Other Development Tasks

## Localisation
Add the strings to one of the locale files
- `config/locales/en/others.yml` For all non-admin and shared keys
- `config/locales/en/administration.yml` For all `administration.*` keys

Run the following rake task to normalize the keys
```sh
bundle exec i18n-tasks normalize -p
```

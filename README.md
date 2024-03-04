# Psychometrics

[![develop](https://img.shields.io/circleci/build/github/TheTalentEnterprise/psychometrics/develop?label=develop&token=b9ae760cbe8b1ebac4bf093beb54c8b35721e0ef)](https://dl.circleci.com/status-badge/redirect/gh/TheTalentEnterprise/psychometrics/tree/develop) [![master](https://img.shields.io/circleci/build/github/TheTalentEnterprise/psychometrics/master?label=master&token=b9ae760cbe8b1ebac4bf093beb54c8b35721e0ef)](https://dl.circleci.com/status-badge/redirect/gh/TheTalentEnterprise/psychometrics/tree/master) [![review](https://img.shields.io/circleci/build/github/TheTalentEnterprise/psychometrics/review?label=review&token=b9ae760cbe8b1ebac4bf093beb54c8b35721e0ef)](https://dl.circleci.com/status-badge/redirect/gh/TheTalentEnterprise/psychometrics/tree/review) [![Depfu](https://badges.depfu.com/badges/4a586aa5bfb8856ff8fe0641b1a7f82e/status.svg)](https://depfu.com) [![Coverage Status](https://coveralls.io/repos/github/TheTalentEnterprise/psychometrics/badge.svg?branch=develop&t=RfKCiF)](https://coveralls.io/github/TheTalentEnterprise/psychometrics?branch=develop)

Javscript [![Depfu](https://badges.depfu.com/badges/135f3c3926127522be587c86206d855b/count.svg)](https://depfu.com/repos/github/TheTalentEnterprise/psychometrics?project_id=11658)

Ruby [![Depfu](https://badges.depfu.com/badges/4a586aa5bfb8856ff8fe0641b1a7f82e/count.svg)](https://depfu.com/repos/github/TheTalentEnterprise/psychometrics?project_id=11657)

## Requisites

Ruby version: 3.1.2

Rails version: 7.0.5

Bundler version: 2.3.17

Node version: 18.16.*

Database: PostgresSql@14

prevent bundle secure warnings with

``` bundle config github.https true ```

# Local Setup

0. Create a Gemset (optional)

    RVM: `$> rvm gemset create tte-psychometrics`
    rbenv: install [rbenv-gemset plugin](https://github.com/jf/rbenv-gemset) then in the project directory run `$> rbenv gemset create [version] [gemset]`

1. `$> bundle install`

    if error: `An error occurred while installing mimemagic (0.4.3), and Bundler cannot continue.`
    on mac: `$> brew install shared-mime-info` and try step 1 again.
3. `$> cp config/application.yml.sample config/application.yml`
4. `$> cp config/database.yml.sample config/database.yml`
5. `$> cp config/settings/development.yml.sample config/settings/development.yml`

    Uncomment and set values for `ENCRYPTED_KEY`, `SECRET_KEY_BASE` and `SECRET_TOKEN_FOR_GENERATE` in `application.yml`.

    Edit and setup `database.yml` as appropriate.

6. Create databases `$> bundle exec rake db:create`

    Ask for a DB dump to load in the local database from a team member. Follow instructions from [here](https://gist.github.com/rohanpujaris/f0bb37c293fefe89f39a9c840248e53a) to load data.

7. `$> yarn install`

8. Install redis.
     For mac follow simple steps: `brew update`, `brew install redis`. For more information check redis-doc [here](https://redis.io/topics/quickstart)
9. To generate report pdf locally clone [this repository](https://github.com/TheTalentEnterprise/serverless-url-to-pdf).
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

1. Setup a loopback address to `ttedev.me` or another preferred local domain
2. start redis server `brew services start redis` or `redis-server`
3. Run the server `bundle exec rails s -p 3030`
4. start vite server with command `./bin/vite dev`.
5. Visit https://ttedev.me:3030

or `./bin/dev` insted of points 3 and 4


# SSL
Add the following environment variables with your **file paths**. Use appropriate local development domains if not using `ttedev.me`


```
SSL="true"
SSL_KEY="./support/dev-ssl/ttedev.me.key"
SSL_CERT="./support/dev-ssl/ttedev.me.pem"
```

1. Add to development section of `config/vite.json`

    `"https": true`
2. Run the server

   `bundle exec rails s -p 3030 -b "ssl://0.0.0.0:3030?key=support/dev-ssl/ttedev.me.key&cert=support/dev-ssl/ttedev.me.pem"`
3. Start Vite server with command `./bin/vite dev` or `SSL_KEY="./support/dev-ssl/ttedev.me.key" SSL_CERT="./support/dev-ssl/ttedev.me.pem" SSL=true ./bin/vite dev`
3. Visit https://ttedev.me:3030

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

# Running mock server
Currently mock server can only run on non ssl mode. For this we would have start rails server and vite server on non ssl mode.

Run below code in terminal to run mock server
```
yarn run mockApi
```

To use mock api, pass `mocked: true` from redux api action
```
export const fetch = () => ({
  type: FETCH,
  request: {
    method: 'get',
    mocked: true,
    url: `/invites`,
  },
})
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

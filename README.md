# Psychometrics

[![develop](https://img.shields.io/circleci/build/github/TheTalentEnterprise/psychometrics/develop?label=develop&token=b9ae760cbe8b1ebac4bf093beb54c8b35721e0ef)](https://dl.circleci.com/status-badge/redirect/gh/TheTalentEnterprise/psychometrics/tree/develop) [![master](https://img.shields.io/circleci/build/github/TheTalentEnterprise/psychometrics/master?label=master&token=b9ae760cbe8b1ebac4bf093beb54c8b35721e0ef)](https://dl.circleci.com/status-badge/redirect/gh/TheTalentEnterprise/psychometrics/tree/master) [![review](https://img.shields.io/circleci/build/github/TheTalentEnterprise/psychometrics/review?label=review&token=b9ae760cbe8b1ebac4bf093beb54c8b35721e0ef)](https://dl.circleci.com/status-badge/redirect/gh/TheTalentEnterprise/psychometrics/tree/review) [![Depfu](https://badges.depfu.com/badges/4a586aa5bfb8856ff8fe0641b1a7f82e/status.svg)](https://depfu.com) [![Coverage Status](https://coveralls.io/repos/github/TheTalentEnterprise/psychometrics/badge.svg?branch=develop&t=RfKCiF)](https://coveralls.io/github/TheTalentEnterprise/psychometrics?branch=develop)

Javscript [![Depfu](https://badges.depfu.com/badges/135f3c3926127522be587c86206d855b/count.svg)](https://depfu.com/repos/github/TheTalentEnterprise/psychometrics?project_id=11658)

Ruby [![Depfu](https://badges.depfu.com/badges/4a586aa5bfb8856ff8fe0641b1a7f82e/count.svg)](https://depfu.com/repos/github/TheTalentEnterprise/psychometrics?project_id=11657)

## Requisites

Ruby version: 3.4.2

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
3. `$> cp .env.sample .env`
4. `$> cp config/database.yml.sample config/database.yml`
5. `$> cp config/settings/development.yml.sample config/settings/development.yml`

    Uncomment and set values for `ENCRYPTED_KEY`, `SECRET_KEY_BASE` and `SECRET_TOKEN_FOR_GENERATE` in `.env`.

    Edit and setup `database.yml` as appropriate.

6. Create databases `$> bundle exec rake db:create`

    Ask for a DB dump to load in the local database from a team member. Follow instructions from [here](https://gist.github.com/rohanpujaris/f0bb37c293fefe89f39a9c840248e53a) to load data. In case you don't have access to the DB dump, you can seed the data manually by following
    step 7.

7. Seed Data by running the following:
   - `$> bundle exec rake db:create`
   - `$> bundle exec rake db:schema:load`
   - `$> bundle exec rake db:migrate`
   - `$> bundle exec rake seed_relationships`
   - `$> bundle exec rake geo:import`

8. `$> yarn install`

    in case of `error Error: unable to get local issuer certificate` run below command

    ```yarn config set "strict-ssl" false -g```

9. Install redis.
     For mac follow simple steps: `brew update`, `brew install redis`. For more information check redis-doc [here](https://redis.io/topics/quickstart)
10. To generate report pdf locally clone [this repository](https://github.com/TheTalentEnterprise/serverless-url-to-pdf).
Follow the instruction mentioned in the README.md to install and run the serverless framework.
In the main psychometric repo set environment variable `URL_TO_PDF_FAAS_ENABLED` to `http://localhost:3000/dev`

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
# Installing lua 5.4

To install lua 5.4 run below command
```
brew install lua@5.4
```
After installation, it will prompt you to add some variables to .zshrc or .bashrc. Follow that step.

Once that is done, you will need to create symlinks for all the necessary components before running bundle install. You might need to open a new terminal and run bundle install. If bundle install doesn't work, you will need to create a symlink:

you may create directories `/usr/local/include` and `/usr/local/lib/` if it's not present
```
sudo ln -s /opt/homebrew/opt/lua@5.4/include/lua5.4 /usr/local/include/lua5.4
sudo ln -s /opt/homebrew/opt/lua@5.4/lib/liblua5.4.dylib /usr/local/lib/liblua5.4.dylib
sudo ln -s /opt/homebrew/opt/lua@5.4/bin/lua5.4 /usr/local/bin/lua5.4
```
Please note that the path where Lua is installed might be different, so replace the above path (/opt/homebrew/opt/lua@5.4/..) with the path where Lua is installed on your machine. To check where Lua is installed, you can run `which lua`



### Installing rlua with bundler
in case of error `error: incompatible function pointer types passing 'VALUE (VALUE)' ` run below command
```
bundle config set --global build.rlua "--with-cflags=-Wno-error=incompatible-function-pointer-types"
```

# Run the application locally

0. Create a Super user to login (optional):
```
$> rails c
$> Users::SuperAdmin.create(
  email: 'email@gmail.com',
  password: 'Password@123',
  first_name: 'FirstName',
  last_name: 'LastName'
)
```

1. Setup a loopback address to `localhost` or another preferred local domain
2. start redis server `brew services start redis` or `redis-server`
3. Run the server `bundle exec rails s -p 3030`
4. start vite server with command `./bin/vite dev`.
5. Visit http://localhost:3030

or `./bin/dev` insted of points 3 and 4


# SSL

## For localhost SSL setup

1. Generate SSL certificates for localhost:
   ```bash
   cd support/dev-ssl && ./generate-localhost-ssl.sh
   ```

2. Add the following environment variables to your `.env` file:
   ```
   SSL="true"
   SSL_KEY="./support/dev-ssl/localhost.key"
   SSL_CERT="./support/dev-ssl/localhost.pem"
   ```

3. Add to development section of `config/vite.json`:
   ```json
   "https": true
   ```

4. Run the server:
   ```bash
   bundle exec rails s -p 3030 -b "ssl://0.0.0.0:3030?key=support/dev-ssl/localhost.key&cert=support/dev-ssl/localhost.pem"
   ```

5. Start Vite server:
   ```bash
   SSL_KEY="./support/dev-ssl/localhost.key" SSL_CERT="./support/dev-ssl/localhost.pem" SSL=true ./bin/vite dev
   ```

6. Visit https://localhost:3030

## For ttedev.me SSL setup

1. Generate SSL certificates for ttedev.me:
   ```bash
   cd support/dev-ssl && ./generate-ttedev-ssl.sh
   ```

2. Add the following environment variables to your `.env` file. Use appropriate local development domains if not using ttedev.me:
   ```
   APP_DOMAIN='ttedev.me'
   VITE_RUBY_HOST='ttedev.me'
   SSL="true"
   SSL_KEY="./support/dev-ssl/ttedev.me.key"
   SSL_CERT="./support/dev-ssl/ttedev.me.pem"
   ```

3. Add to development section of `config/vite.json`:
   ```json
   "https": true
   ```

4. Run the server:
   ```bash
   bundle exec rails s -p 3030 -b "ssl://0.0.0.0:3030?key=support/dev-ssl/ttedev.me.key&cert=support/dev-ssl/ttedev.me.pem"
   ```

5. Start Vite server with command:
   ```bash
   ./bin/vite dev
   ```
   Or with explicit SSL configuration:
   ```bash
   SSL_KEY="./support/dev-ssl/ttedev.me.key" SSL_CERT="./support/dev-ssl/ttedev.me.pem" SSL=true ./bin/vite dev
   ```

6. Visit https://ttedev.me:3030


# Reverse Proxy
Reverse proxy can be used to publicly expose local development environment to receive webhooks.

1. Set `domain` to `project458.com`
1. Set `subdomain` to `www`
1. Set `protocol` to `http`; SSL termination happens on the proxy server
1. Run rails server without SSL
1. Ensure your ssh public key is added in the proxy server
1. Start reverse proxy session by running `ssh -R 3030:localhost:3030 root@reverse-proxy.tte-work.com`

Following the above steps, your local development environment should be accessible via `https://www.project458.com`

# Receive emails in local development environment

1. Install mailhog from [here](https://github.com/mailhog/MailHog)
2. Run mailhog server `brew services start mailhog`
3. Visit `http://localhost:8025` in your browser to see received emails.

# Run tests

To run rails unit test
```sh
bundle exec rspec
```

To run vitest unit test

we need to generate translations which can be done by use following rake command
```sh
rake i18n:js:export
```
then
```sh
yarn run test
```
Check package.json for more details

# Generating translations in different languages

Every string that you add, should be added through `config/locales/{locale_name}/*.yml`.
Steps
- Add english language strings in config/locales/en/*.yml
- Run `./bin/devtools I18n auto_translate_yml --base-branch=develop`, to auto translate this string in different languages. It will update yml files in for different languages
- Verify the changes and commit all changes from `config/locales/{locale_name}/*.yml.` files

# Mocking API Responses
To mock v2 API responses, add the following to the controller:
```
include Api::V2::Administration::Concerns::MockedResponse
```

### Mocking CRUD Actions

If you want to mock CRUD actions, you can use one of the following options based on your requirements:

```
mock_crud_actions
mock_crud_actions only: %i[index]
mock_crud_actions except: %i[index]
```

### Mocking Custom Actions

If you want to mock a custom action, add the following in the controller:

```
mock_custom_actions %i[action_name]
```

### Adding Mocked Responses

You can add actual mocked responses in:
```
app/controllers/api/v2/administration/#{controller_name}_mocks/#{action_name}.json.
```

### Updating Routes

Additionally, you need to add the routes in routes.rb as usual.

# Other Development Tasks

## MinIO (Local Development)
For local development, we use MinIO as an S3-compatible storage solution.
See our [MinIO Integration Guide](docs/minio_integration.md) for setup instructions.

## Localisation
Add the strings to one of the locale files
- `config/locales/en/others.yml` For all non-admin and shared keys
- `config/locales/en/administration.yml` For all `administration.*` keys

Run the following rake task to normalize the keys
```sh
bundle exec i18n-tasks normalize -p
```

# Production build setup on local
 Check following wiki https://github.com/TheTalentEnterprise/psychometrics/wiki/Production-build-setup-on-localhost

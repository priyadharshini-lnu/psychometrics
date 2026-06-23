# frozen_string_literal: true

source 'https://rubygems.org'
ruby '3.4.6'

gem 'acts_as_tenant', '~> 1.0', '>= 1.0.1'
gem 'bootsnap',                   '~> 1.18.0', require: false
gem 'bundler',                    '~> 2.3.17'
gem 'erb',                        '< 5.0' # Pin to avoid frozen string issues in ERB 6.0+ with Ruby 3.4
gem 'rack',                       '~> 3.2.6'

gem 'barnes', '~> 0.0.7'
gem 'faraday', '~> 1.10.5'
gem 'jbuilder', '~> 2.12.0'
gem 'jquery-rails', '~> 4.4.0'
gem 'jwt', '~> 2.10'
gem 'newrelic_rpm', '~> 10.5', group: 'production', require: ENV.fetch('NEW_RELIC_AGENT_ENABLED', 'false') == 'true'
gem 'panko_serializer', '~> 0.8.3'
gem 'paper_trail'
gem 'paper_trail-association_tracking'
gem 'pg',                         '~> 1.4'
gem 'rails',                      '~> 8.0.0'
gem 'rails-i18n',                 '~> 8.0'
gem 'sassc-rails', '~> 2.1.2'
gem 'sprockets-rails'
gem 'terser', '~> 1.1.11' if ENV.fetch('DISABLE_TERSER', 'false') == 'false'
gem 'vite_rails'
gem 'vite_ruby'

### Authentication and authorization
gem 'devise',                     '~> 5.0.4'
gem 'devise-i18n',                '~> 1.9.2'
gem 'devise_invitable',           '~> 2.0.9'
gem 'devise-passwordless',        '~> 1.0.1'
gem 'devise_saml_authenticatable', '~> 1.9.1'
gem 'saml_idp', '~> 1.0.0'

gem 'dotiw', '~> 5.3.3'
gem 'icalendar', '~> 2.12.2'

# Two factor authentication (inlined from gem into lib/two_factor_authentication)
gem 'rotp', '~> 6.3'

gem 'devise-security', '~> 0.18.0'

gem 'activerecord-session_store', '~> 2.1'

gem 'pundit', '~> 2.1.1'

### Assets
gem 'bh',                         '~> 1.3'
gem 'bootstrap-sass',             '~> 3.4.1'
gem 'font-awesome-rails',         '~> 4.7'
# gem 'noty-rails',                 '~> 2.3.8'

### TEMPLATES
gem 'slim-rails',                 '~> 3.4.0'
### FORM BUILDERS
gem 'cocoon', '1.2.15'
gem 'simple_form',                '5.1.0'
### Pagination helpers
gem 'bootstrap-kaminari-views',   '~> 0.0.5'
gem 'kaminari', git: 'https://github.com/kaminari/kaminari', branch: 'master'
### Breadcrumbs
gem 'breadcrumbs_on_rails',       '~> 4.1.0'
### Filter data list
gem 'filterrific',                '~> 2.0.5'
gem 'ransack',                    '~> 4.2'
### Navigation helper
gem 'active_link_to',             '~> 1.0.5'

### Translaters for javascripts
gem 'i18n-js',                    '~> 3.9.2'

### Decorator
gem 'draper', '~> 4.0.2'
### For organisation ENV variable
gem 'config',                     '~> 5.1.0'
gem 'figaro',                     '~> 1.2.0'

gem 'premailer-rails',            '~> 1.11.1'

gem 'net-imap',                   '~> 0.6.4.1'

### XLS import
gem 'file_validators',            '~> 3.0.0'
gem 'rubyXL',                     '~> 3.4.6'

# For unpoad file as Ajax
gem 'jquery-fileupload-rails', '~> 0.4.6'
gem 'redis', '~> 4.7.1'
gem 'redlock', '~> 1.2.2'

# A workaround for `roo` since it requires an old version of rubyzip
gem 'rubyzip', '~> 2.3'

### dependencies for XLS export (via templates)
# gem 'axlsx', git: 'http://github.com/randym/axlsx.git', ref: 'c8ac844'
gem 'caxlsx', '~> 3.2'
gem 'caxlsx_rails', '~> 0.6'
gem 'fast_excel', '~> 0.5.0'
gem 'roo', '~> 2.9'

### manage position field. For move_up|down does 2 selects and 3 updates. Can be better.
gem 'acts_as_list', '~> 1.0.2'

# Gem for implementing tagging functionality in Rails models
gem 'acts-as-taggable-on', '~> 12.0'

### add fake destroying logic for models

# Error tracking
gem 'sentry-rails', '~> 6.2.0'
gem 'sentry-sidekiq', '~> 6.2.0'

# Cloning ActiveRecord object
gem 'deep_cloneable', '~> 3.2'

gem 'active_storage_base64', '~> 2.0'
gem 'active_storage_svg_sanitizer'
gem 'active_storage_validations', '~> 1.0.3'
gem 'ancestry', '~> 3.0.0'
gem 'audited', '~> 5.6'
gem 'aws-sdk-cloudfront', '~> 1'
gem 'aws-sdk-s3', '~> 1'
gem 'aws-sdk-sqs', '~> 1.38.0'
gem 'aws-sigv4', '~> 1'
gem 'browser', '~> 5.3.1'
gem 'fog-aws', '~> 3.5.2'
gem 'hashids', '~> 1.0.5'
gem 'image_processing', '~> 1.2'
gem 'inky-rb', '~> 1.4.2.1', require: 'inky'
gem 'mini_magick', '~> 4.11.0'
gem 'remotipart', '~> 1.3.1'

gem 'chronic', '~> 0.10.2'
gem 'mustache', '~> 1.1.1'
gem 'rectify', git: 'https://github.com/TheTalentEnterprise/rectify.git', branch: 'tte-master'
gem 'sidekiq', '~> 7.3.10'

gem 'dry-swagger', '~> 0.7.2'
gem 'dry-validation', '~> 1.10'
gem 'jsonpath', '~> 1.1.2'
gem 'mobility', '~> 1.2.9'
gem 'reform-rails', '~> 0.2.3'
gem 'validates_timeliness', '~> 8.0'
gem 'virtus', '~> 1.0.5'

gem 'csv-safe'

# SOAP client
gem 'nkf'
gem 'savon', '~> 2.15.1'
# Abort requests that are taking too long
gem 'rack-timeout', '~> 0.4.2'

### Adding mime types support gem
gem 'mimemagic'
# for service objects
gem 'interactor', '~> 3.1.2'
# Help ActiveRecord::Enum feature to work fine with I18n and simple_form.
gem 'enum_help', '~> 0.0.17'
# A simple date validator for Rails
gem 'attr_encrypted'
gem 'brakeman'
gem 'date_validator', '~> 0.12.0'
gem 'encryptor', '~> 3.0.0'
gem 'jsonapi-utils', git: 'https://github.com/livestorm/jsonapi-utils'
gem 'rlua', git: 'https://github.com/TheTalentEnterprise/rlua', branch: 'tte-master'
gem 'rswag-api', '~> 2.16.0'
gem 'rswag-ui', '~> 2.16.0'
gem 'tty-progressbar', '~> 0.10.1', require: false

gem 'activerecord-import', '~> 1.7.0'
gem 'possessive', '~> 1.0.1'

gem 'addressable', '~> 2.9.0'
gem 'rails_autoscale_agent', '~> 0.10.2'
gem 'shortener', '~> 1.0.1'
gem 'twilio-ruby', '~> 7.8.3'
gem 'workflow-activerecord', '~> 4.1.2'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'awesome_print', '~> 1.9.2'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'byebug', platform: :mri
  gem 'dry-cli', '~> 1.2.0'
  gem 'factory_bot_rails'
  gem 'hirb'
  gem 'parallel_tests', '~> 4.2'
  gem 'pry-byebug', '~> 3.10.1'
  gem 'pry-rails', '~> 0.3.9'
  gem 'rspec-rails', '~> 6.1'
  # A fake data generator
  ### Generate schema in each model
  gem 'deepl-rb'
  gem 'derailed_benchmarks', '~> 1.7.0'
  gem 'i18n-tasks', '~> 1.0.15'
  gem 'rswag-specs', '~> 2.11'
  gem 'rubocop', '= 1.79.2', require: false
  gem 'rubocop-performance', '= 1.25.0'
  gem 'rubocop-rails', '= 2.33.4', require: false
  gem 'rubocop-rspec', require: false
  gem 'stackprof', '~> 0.2.12'

  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'dotenv'
  gem 'spring', '~> 4.1.1'
  gem 'spring-commands-parallel-tests'
end

group :development do
  gem 'bullet', '~> 8.0'
  gem 'listen', '~> 3.7.1'
  gem 'spring-watcher-listen', '~> 2.1.0'

  gem 'db-clone', git: 'https://github.com/smshuja/db-clone.git', branch: 'load-with-erb'
  gem 'guard', '~> 2.18.0'
  # TODO: We have forked the gem to just increase the version dependent gem.
  # We can remove this fork and use original gem once the next version of gem is released.
  gem 'meta_request', '~> 0.8.2'
  gem 'ruby-lsp-rails', '~> 0.4.8'
  gem 'solargraph', '~>0.54.0'
end

group :test do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'capybara', '~> 3.37.1'
  gem 'coveralls_reborn', '~> 0.28.0', require: false
  gem 'database_cleaner', '~> 2.0.1'
  gem 'faker', '~> 2.21'
  gem 'jsonapi-rspec', '~> 0.0.11'
  gem 'rails-controller-testing', '~> 1.0.4'
  gem 'rspec-retry', '~> 0.6.1'
  gem 'rubocop-faker'
  gem 'shoulda-matchers', '~> 6.0'
  gem 'simplecov', '~> 0.22.0'
  gem 'timecop', '~> 0.9.1'
  gem 'webmock', '~> 3.14.0'
  gem 'wisper-rspec', '~> 1.1.0', require: false
  gem 'with_model', '~> 2.1.5'
end

# for creating and rendering QR codes into various formats
gem 'rqrcode', '~> 2.1.1'

# a scheduling add-on for sidekiq
gem 'sidekiq-cron', '~> 2.4.0'

gem 'xml-simple', '~> 1.1.5'

# required for azure
gem 'sidekiq_alive', '~> 2.5.0'

gem 'psych', '~> 5.0'

gem 'pry', '~> 0.14.2'

gem 'ostruct', '~> 0.6.1'

gem 'statistics', '~> 1.0'
gem 'syslog'
gem 'syslog-logger', '~> 1.6'

gem 'rails_semantic_logger', '~> 4.14'
gem 'semantic_logger', '~> 4.15'

# TO handle authentication with Oracle
gem 'oci', '~> 2.22.0'

# Sidekiq queue concurrency control
gem 'sidekiq-throttled', '~> 1.5.2'

gem 'recaptcha', require: 'recaptcha/rails'

# To integrate with LLMs
gem 'ruby_llm', git: 'https://github.com/crmne/ruby_llm', tag: '1.13.2'

# TO handle structured data in LLM responses
gem 'ruby_llm-schema', '~> 0.2.1'

# Pure Ruby GeoIP2 MaxMind DB reader
gem 'maxminddb'

# For storing and querying vector embeddings in Postgres
gem 'neighbor'

# for prompt templating and other templating
gem 'liquid'

# webhook_system dependencies
gem 'faraday-encoding'
gem 'oauth2', '~> 2.0'
gem 'ph_model'
gem 'validate_url', '~> 1.0'

gem 'falcon-rails', '~> 0.2.4'

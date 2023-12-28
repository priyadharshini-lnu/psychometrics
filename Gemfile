# frozen_string_literal: true

source 'https://rubygems.org'
ruby '3.1.2'
gem 'bundler',                    '~> 2.3.17'
gem 'rack',                       '~> 2.2.0'

gem 'barnes',                     '~> 0.0.7'
gem 'bootsnap', '>= 1.12.0', require: false
gem 'faraday',                    '~> 1.10.0'
gem 'jbuilder',                   '~> 2.10.0'
gem 'jquery-rails',               '~> 4.4.0'
gem 'jwt',                        '~> 2.2.2'
# gem 'newrelic_rpm',               '~> 9.2', '>= 9.2.2', group: 'production'
gem 'panko_serializer', '~> 0.8.1'
gem 'pg',                         '~> 1.4'
gem 'puma',                       '~> 5.6.7'
gem 'rails',                      '~> 7.1.2'
gem 'rails-i18n',                 '~> 7.0'
gem 'sassc-rails', '~> 2.1.2'
gem 'sprockets-rails'
gem 'terser', '~> 1.1.11' if ENV.fetch('DISABLE_TERSER', 'false') == 'false'
gem 'vite_rails'
gem 'vite_ruby'

source 'https://rails-assets.org/' do
  gem 'rails-assets-bootstrap', '~> 3.3.7'
  gem 'rails-assets-bootstrap-add-clear', '1.0.6'
  gem 'rails-assets-bootstrap-colorpicker', '2.3.6'
  gem 'rails-assets-bootstrap-datetimepicker-3', '4.17.47'
  gem 'rails-assets-bootstrap-file-input', '1.0.0'
  gem 'rails-assets-bootstrap-select', '~> 1.11.0'
  gem 'rails-assets-datatables', '1.10.12'
  gem 'rails-assets-jquery', '1.12'
  gem 'rails-assets-jquery.fileDownload', '1.4.2'
  gem 'rails-assets-jquery-serialize-object', '2.5.0'
  gem 'rails-assets-js-cookie', '2.1.3'
  gem 'rails-assets-ladda', '~> 1.0.5'
  gem 'rails-assets-lodash', '~> 4.17.11'
  gem 'rails-assets-moment', '~> 2.29.1'
  gem 'rails-assets-moment-timezone', '~> 0.5.14'
  gem 'rails-assets-multiselect', '0.9.12'
  gem 'rails-assets-mustache.js', '~> 2.2.1'
  gem 'rails-assets-noty', '~> 2.3.8'
  gem 'rails-assets-quicksearch', '2.3.1'
  gem 'rails-assets-Sortable', '1.6.0'
  gem 'rails-assets-x-editable', '~> 1.5.0'
end

### Authentication and authorization
gem 'devise',                     '~> 4.9.2'
gem 'devise-i18n',                '~> 1.9.2'
gem 'devise_invitable',           '~> 2.0.2'
gem 'devise-passwordless',        '~> 1.0.1'
gem 'devise_saml_authenticatable', '~> 1.7.0'

gem 'dotiw', '~> 5.3.3'
gem 'icalendar', '~> 2.9.0'

# two_factor_authentication should be before devise-security, so that 2fa is required before changing expired password
# rubocop:disable Bundler/OrderedGems, Lint/RedundantCopDisableDirective
gem 'two_factor_authentication', git: 'https://github.com/TheTalentEnterprise/two_factor_authentication',
  branch: 'fix_deprecated_methods'
# rubocop:enable Bundler/OrderedGems, Lint/RedundantCopDisableDirective
gem 'devise-security', '~> 0.17.0'
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
gem 'ransack',                    '~> 4.1.1'
### Navigation helper
gem 'active_link_to',             '~> 1.0.5'

### Translaters for javascripts
gem 'i18n-js',                    '~> 3.9.2'

### Decorator
gem 'draper', '~> 4.0.2'
### For organisation ENV variable
gem 'config',                     '~> 4.2.0'
gem 'figaro',                     '~> 1.2.0'

gem 'premailer-rails',            '~> 1.11.1'

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
gem 'roo', '~> 2.9'

### manage position field. For move_up|down does 2 selects and 3 updates. Can be better.
gem 'acts_as_list', '~> 1.0.2'

### add fake destroying logic for models
gem 'active_model_serializers', '~> 0.10.14'

# Error tracking
gem 'sentry-rails', '~> 5.12.0'
gem 'sentry-sidekiq', '~> 5.12.0'

# DSL for activerecord
gem 'baby_squeel', git: 'https://github.com/TheTalentEnterprise/baby_squeel', branch: 'tte-master'

# Cloning ActiveRecord object
gem 'deep_cloneable', '~> 3.2'

gem 'active_storage_validations', '~> 1.0.3'
gem 'ancestry', '~> 3.0.0'
gem 'audited', '~> 5.4.2'
gem 'aws-sdk-s3', '~> 1'
gem 'aws-sdk-sqs', '~> 1.38.0'
gem 'aws-sigv4', '~> 1'
gem 'browser', '~> 5.3.1'
gem 'carrierwave', '~> 1.3.2'
gem 'carrierwave-base64', '~> 2.5.3'
gem 'carrierwave_direct', '~> 2.1.0'
gem 'fog-aws', '~> 3.5.2'
gem 'image_processing', '~> 1.2'
gem 'inky-rb', '~> 1.4.2.1', require: 'inky'
gem 'mini_magick', '~> 4.11.0'
gem 'remotipart', '~> 1.3.1'

gem 'chronic', '~> 0.10.2'
gem 'mustache', '~> 1.1.1'
gem 'rectify', '~> 0.13.0'
gem 'sidekiq', '~> 7.1.6'

gem 'hashids', '~> 1.0.5'

gem 'dry-swagger', '~> 0.7.2'
gem 'dry-validation', '~> 1.10'
gem 'jsonpath', '~> 1.1.2'
gem 'mobility', '~> 1.2.9'
gem 'reform-rails', '~> 0.2.3'
gem 'validates_timeliness', '7.0.0.beta2' # TODO: upgrade when released non-beta
gem 'virtus', '~> 1.0.5'

# SOAP client
gem 'savon', '~> 2.12.1'
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
gem 'js-routes', '~> 1.4.4'
gem 'rswag-api', '~> 2.11.0'
gem 'rswag-ui', '~> 2.11.0'
gem 'tty-progressbar', '~> 0.16.0', require: false

gem 'activerecord-import', '~> 1.5.0'
gem 'possessive', '~> 1.0.1'

gem 'addressable', '~> 2.7'
gem 'rails_autoscale_agent', '~> 0.10.2'
gem 'shortener', '~> 0.8.2'
gem 'twilio-ruby', '~>  5.58.1'
gem 'webhook_system', git: 'https://github.com/TheTalentEnterprise/webhook_system.git', branch: 'tte-master'
gem 'workflow-activerecord', '~> 4.1.2'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'awesome_print', '~> 1.9.2'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'bundler-audit', require: false
  gem 'byebug', platform: :mri
  gem 'factory_bot_rails'
  gem 'hirb'
  gem 'parallel_tests', '~> 4.2'
  gem 'pry-byebug', '~> 3.9.0'
  gem 'pry-rails', '~> 0.3.4'
  gem 'rspec-rails', '~> 5.1.2'
  # A fake data generator
  ### Generate schema in each model
  gem 'derailed_benchmarks', '~> 1.7.0'
  gem 'i18n-tasks', '~> 1.0'
  gem 'rswag-specs', '~> 2.11'
  gem 'rubocop', '~>  1.31.2', require: false
  gem 'rubocop-performance'
  gem 'rubocop-rails', require: false
  gem 'rubocop-rspec', require: false
  gem 'stackprof', '~> 0.2.12'
end

group :development do
  gem 'bullet', '~> 7.1.3'
  gem 'listen', '~> 3.7.1'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring', '~> 4.1.1'
  gem 'spring-watcher-listen', '~> 2.1.0'

  gem 'db-clone', git: 'https://github.com/smshuja/db-clone.git', branch: 'load-with-erb'
  gem 'guard', '~> 2.18.0'
  # TODO: We have forket the gem to just increase the version dependent gem.
  # We can remove this fork and use original gem once the next version of gem is released.
  gem 'meta_request', git: 'https://github.com/TheTalentEnterprise/rails_panel', branch: 'tte-master'
  gem 'solargraph', '~>0.45.0'
end
group :test do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'capybara', '~> 3.37.1'
  gem 'coveralls_reborn', '~> 0.24.0', require: false
  gem 'database_cleaner', '~> 2.0.1'
  gem 'faker', '~> 2.21'
  gem 'jsonapi-rspec', '~> 0.0.11'
  gem 'rails-controller-testing', '~> 1.0.4'
  gem 'rspec-retry', '~> 0.6.1'
  gem 'rubocop-faker'
  gem 'shoulda-matchers', '~> 4.3.0'
  gem 'simplecov', '~> 0.21.2'
  gem 'timecop', '~> 0.9.1'
  gem 'webmock', '~> 3.14.0'
  gem 'wisper-rspec', '~> 1.1.0', require: false
  gem 'with_model', '~> 2.1.5'
end

# for creating and rendering QR codes into various formats
gem 'rqrcode', '~> 2.1.1'

# a scheduling add-on for sidekiq
gem 'sidekiq-cron', '~> 1.10.1'

gem 'xml-simple', '~> 1.1.5'

# required for azure
gem 'sidekiq_alive', '~> 2.1.4'

gem 'psych', '3.3.2'

gem 'rufus-lua', '~> 1.1'

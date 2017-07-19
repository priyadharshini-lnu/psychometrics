source 'https://rubygems.org'
gem 'bundler',                    '>= 1.8.4'

gem 'rails',                      '~> 5.0.0'
gem 'pg',                         '~> 0.18.4'
gem 'puma',                       '~> 3.8'
gem 'sass-rails',                 '~> 5.0'
gem 'uglifier',                   '>= 1.3.0'
gem 'coffee-rails',               '~> 4.2'
gem 'jquery-rails',               '~> 4.1.1'
gem 'jquery-rails-cdn',           '~> 1.1.2'
gem 'jbuilder',                   '~> 2.6.1'

source 'https://rails-assets.org' do
  gem 'rails-assets-jquery', '1.12'
  gem 'rails-assets-noty'
  gem 'rails-assets-bootstrap-select'
  gem 'rails-assets-x-editable', '1.5.0'
  gem 'rails-assets-mustache.js'
  gem 'rails-assets-bootstrap-colorpicker', '2.3.6'
  gem 'rails-assets-bootstrap-file-input', '1.0.0'
  gem 'rails-assets-multiselect', '0.9.12'
  gem 'rails-assets-quicksearch', '2.3.1'
  gem 'rails-assets-bootstrap-add-clear', '1.0.6'
  gem 'rails-assets-datatables', '1.10.12'
  gem 'rails-assets-summernote', '0.8.6'
  gem 'rails-assets-js-cookie', '2.1.3'
  gem 'rails-assets-jquery-serialize-object', '2.5.0'
end

### Authentication and authorization
gem 'devise',                     '~> 4.2.0'
gem 'devise_invitable',           '~> 1.6.0'
gem 'devise-i18n',                '~> 1.1.0'
gem 'pundit',                     '~> 1.1.0'
### Assets
gem 'bootstrap-sass',             '~> 3.3.6'
gem 'bh',                         '~> 1.3'
gem 'font-awesome-rails',         '~> 4.6.3.0'
# gem 'noty-rails',                 '~> 2.3.8'

### TEMPLATES
gem 'slim-rails',                 '~> 3.1.0'
### FORM BUILDERS
gem 'simple_form',                '3.4.0'
gem 'cocoon', '1.2.9'
### Pagination helpers
gem 'kaminari',                   '~> 0.17.0'
gem 'bootstrap-kaminari-views',   '~> 0.0.5'
### Breadcrumbs
gem 'breadcrumbs_on_rails',       '~> 2.3.1'
### Filter data list
gem 'filterrific',                '~> 2.0.5'
gem 'ransack', '~> 1.8.2'
### Navigation helper
gem 'active_link_to',             '~> 1.0.3'

### Translaters for javascripts
gem 'i18n-js',                    '~> 3.0.0.rc3'

### Decorator
gem 'activemodel-serializers-xml'
gem 'draper',                     '~> 3.0.0'
### Generate schema in each model
gem 'annotate', '~> 2.7.0', github: 'ctran/annotate_models'

### For organisation ENV variable
gem 'figaro',                     '~> 1.1.1'
gem 'config',                     '~> 1.2.1'

gem 'psychometrics-survey', git: 'git@github.com:SumatoSoft/psychometrics-survey.git'
### XLS import
gem 'rubyXL'
gem 'file_validators',            '~> 2.1.0'

# For import csv
gem 'smarter_csv',                '~> 1.1.0'
# For unpoad file as Ajax
gem 'jquery-fileupload-rails',    '~> 0.4.6'
gem 'redis'

gem 'ckeditor'

### dependencies for XLS export (via templates)
gem 'axlsx', github: 'randym/axlsx', ref: 'c8ac844'
gem 'axlsx_rails', '~> 0.4.0'
gem 'roo', '~> 2.4.0'

gem 'i18n-tasks', '~> 0.9.5'

### manage position field. For move_up|down does 2 selects and 3 updates. Can be better.
gem 'acts_as_list', '~> 0.8.1'

### add fake destroying logic for models
gem 'paranoia', '~> 2.2'
gem 'active_model_serializers', '~> 0.10.0'
gem 'airbrake', '~> 5.0'

# DSL for activerecord
gem 'baby_squeel', '~> 1.0.1'

# Cloning ActiveRecord object
gem 'amoeba', '~> 3.0.0'
gem 'deep_cloneable', '~> 2.2.1'

gem 'carrierwave', '~> 0.11.2'
gem 'carrierwave-base64', '~> 2.5.3'
gem 'remotipart', '~> 1.2'
gem 'mini_magick', '~> 4.5.1'
gem 'carrierwave-aws', '~>1.0.1'

gem 'ancestry'

gem 'mustache', '~> 1.0.3'
gem 'sidekiq', '~> 4.2.4'
gem 'chronic', '~> 0.10.2'
gem 'whenever', '~> 0.9.7', require: false

gem 'hashids', '~> 1.0.2'
gem 'react-rails', '~> 1.10.0'
gem 'bootstrap-slider-rails'

gem 'money-rails', '~> 1.7.0'
gem 'validates_timeliness', '~> 4.0.2'
gem 'virtus', '~> 1.0.5'

# SOAP client
gem 'savon', '~> 2.11.0'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
  gem 'pry-byebug'
  gem 'pry-rails'
  gem 'hirb'
  gem 'rspec-rails', '~> 3.5'
  gem 'factory_girl_rails', '~> 4.7.0'
  # A fake data generator
  gem 'forgery', '0.6.0'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'debugger2'
  gem 'web-console'
  gem 'listen', '~> 3.0.5'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'

  gem 'capistrano',               '3.6.0'
  gem 'capistrano-rails',         '~> 1.1.6'
  gem 'capistrano-passenger',     '~> 0.2.0'
  gem 'capistrano-rvm',           '~> 0.1.2'
  gem 'capistrano-sidekiq'
  gem 'guard'
end
group :test do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'capybara', '~> 2.13'
  gem 'poltergeist', '~> 1.14.0'
  gem 'capybara-screenshot', '~> 1.0.14'
  gem 'selenium-webdriver'
  gem 'shoulda', '~> 3.5.0'
  gem 'database_cleaner', '~> 1.5.3'
  gem 'simplecov', require: false
end

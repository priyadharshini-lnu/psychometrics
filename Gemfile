source 'https://rubygems.org'
gem 'bundler',                    '>= 1.8.4'

gem 'rails',                      '~> 5.0.0'
gem 'pg',                         '~> 0.18.4'
gem 'puma',                       '~> 3.0'
gem 'sass-rails',                 '~> 5.0'
gem 'uglifier',                   '>= 1.3.0'
gem 'coffee-rails',               '~> 4.2'
gem 'jquery-rails',               '~> 4.1.1'
gem 'jquery-rails-cdn',           '~> 1.1.2'

source 'https://rails-assets.org' do
  gem 'rails-assets-jquery', '1.12'
  gem 'rails-assets-noty'
  gem 'rails-assets-bootstrap-select'
  gem 'rails-assets-x-editable', '1.5.0'
  gem 'rails-assets-mustache.js'
end

### Authentication and authorization
gem 'devise',                     '~> 4.2.0'
gem 'devise_invitable',           '~> 1.6.0'
gem 'devise-i18n',                '~> 1.1.0'
gem 'pundit',                     '~> 1.1.0'
### Assets
gem 'bootstrap-sass',             '~> 3.3.6'
gem 'font-awesome-rails',         '~> 4.6.3.0'
#gem 'noty-rails',                 '~> 2.3.8'

### TEMPLATES
gem 'slim-rails',                 '~> 3.1.0'
### FORM BUILDERS
gem 'simple_form',                '~> 3.2.1'
### Pagination helpers
gem 'kaminari',                   '~> 0.17.0'
gem 'bootstrap-kaminari-views',   '~> 0.0.5'
### Breadcrumbs
gem 'breadcrumbs_on_rails',       '~> 2.3.1'
### Filter data list
gem 'filterrific',                '~> 2.0.5'
### Navigation helper
gem 'active_link_to',             '~> 1.0.3'

### Translaters for javascripts
gem 'i18n-js',                    '~> 3.0.0.rc3'

### Decorator
gem 'activemodel-serializers-xml', github: 'rails/activemodel-serializers-xml'
### Fixed gem for decorator (rails 5)
gem 'draper', github: 'audionerd/draper', branch: 'rails5'
### Generate schema in each model
gem 'annotate',                   '~> 2.7.0', github: 'ctran/annotate_models'
### Tree
gem 'ancestry',                  github: 'stefankroes/ancestry', branch: '2-1-stable'
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

gem 'paperclip',                  '~> 5.0.0'

### dependencies for XLS export (via templates)
gem 'axlsx', github: 'randym/axlsx', ref: '7026a84'
gem 'axlsx_rails', '~> 0.4.0'
gem 'roo', '~> 2.4.0'

gem 'i18n-tasks', '~> 0.9.5'

### manage position field. For move_up|down does 2 selects and 3 updates. Can be better.
gem 'acts_as_list', '~> 0.7.6'

### add fake destroying logic for models
gem 'paranoia', github: 'rubysherpas/paranoia', branch: 'rails5'
gem 'active_model_serializers', '~> 0.10.0'
gem 'airbrake', '~> 5.0'
group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
  gem 'rspec-rails', '~> 3.5'
  gem 'factory_girl_rails', '~> 4.7.0'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'pry'
  gem 'web-console'
  gem 'listen', '~> 3.0.5'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'

  gem 'capistrano',               '~> 3.5.0'
  gem 'capistrano-rails',         '~> 1.1.6'
  gem 'capistrano-passenger', '~> 0.2.0'
  gem 'capistrano-rvm',           '~> 0.1.2'
end

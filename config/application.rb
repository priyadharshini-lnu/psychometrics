require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Psychometrics
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Load all translates inside folders
    #
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}')]
    config.i18n.available_locales = [:en]

    config.active_record.schema_format = :sql

    config.autoload_paths << Rails.root.join('app/forms')
    config.autoload_paths << Rails.root.join('lib')

    config.eager_load_paths << Rails.root.join('lib')
  end
end

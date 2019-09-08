# frozen_string_literal: true

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
    config.time_zone = Settings.timezone

    # Load all translates inside folders
    #
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}')]
    config.i18n.available_locales = %i[en ar bg bs ca cn cs cy da de el en-GB eo es es-ES et fa fr gu he hi hr hu id it ja km ko
                                       lt lv mk mn ms my nl no pl pt-BR pt ro ru sk sl sr sv sw ta th tr uk ur vi zh zh-TW]
    config.i18n.default_locale = :en
    config.i18n.locale = :en
    config.i18n.fallbacks = [:en]
    config.active_record.schema_format = :sql
    config.autoload_paths << Rails.root.join('app/forms')
    config.autoload_paths << Rails.root.join('lib')
    config.eager_load_paths << Rails.root.join('lib')
    # Setup Active Job to use Sidekiq
    config.active_job.queue_adapter = :sidekiq
  end
end

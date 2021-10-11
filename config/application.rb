# frozen_string_literal: true

require_relative 'boot'
require 'rails/all'
require_relative '../lib/middlewares/set_locale_middleware'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Psychometrics
  class Application < Rails::Application
    config.time_zone = Settings.timezone
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.2
    config.active_record.belongs_to_required_by_default = false

    # Load all translates inside folders
    #
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}')]
    config.i18n.available_locales = %i[en ar bg bs ca cn cs cy da de el en-GB eo es es-ES et fa fr gu he hi hr hu id it
                                       ja km ko
                                       lt lv mk mn ms my nl no pl pt-BR pt ro ru sk sl sr-Cyrl sr-Latn sv sw ta th tl
                                       tr uk ur vi zh zh-TW]

    config.i18n.default_locale = :en
    config.i18n.locale = :en
    config.i18n.fallbacks = [:en]
    config.active_record.schema_format = :sql
    config.autoload_paths << Rails.root.join('app/forms')
    config.autoload_paths << Rails.root.join('lib')
    config.eager_load_paths << Rails.root.join('lib')
    # Setup Active Job to use Sidekiq
    config.active_job.queue_adapter = :sidekiq

    config.action_mailer.asset_host = Settings.asset_host || URI::Generic.build(
      host: Settings.domain, scheme: Settings.protocol || 'https',
      port: Settings.port
    ).to_s

    config.to_prepare do
      Devise::Mailer.layout '/mailer/layouts/end_user_email'
    end

    config.middleware.use SetLocaleMiddleware

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
  end
end

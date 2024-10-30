# frozen_string_literal: true

require_relative 'boot'
require 'rails/all'
require_relative '../lib/middlewares/set_locale_middleware'
require_relative '../lib/middlewares/check_session'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Psychometrics
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0
    config.action_dispatch.cookies_same_site_protection = :none
    config.active_record.belongs_to_required_by_default = false
    # setting default storage service, this will fallback to this service throughout the application
    config.active_storage.service = ENV.fetch('PUBLIC_BUCKET_STORAGE_SERVICE_KEY', 's3_public_bucket')

    # NOTE: in rails 7 default image processor will be :vips
    config.active_storage.variant_processor = :mini_magick
    config.active_storage.track_variants = true
    config.active_storage.service_urls_expire_in = 10.minutes

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
    config.time_zone = Settings.timezone
    config.eager_load_paths += Dir[Rails.root.join('lib')]

    # Load all translates inside folders
    #
    config.i18n.load_path += Dir.glob(Rails.root.join('config/locales/**/*.{rb,yml}'))
    config.i18n.available_locales = %i[en ar bg bs ca cn cs cy da de el en-GB eo es es-ES et fa fr gu he hi hr hu id it
                                       ja km ko
                                       lt lv mk mn ms my nl no pl pt-BR pt ro ru sk sl sr-Cyrl sr-Latn sv sw ta th tl
                                       tr uk ur vi zh zh-TW zh-HK]

    config.i18n.default_locale = :en
    config.i18n.locale = :en
    config.i18n.fallbacks = [:en]
    config.active_record.schema_format = :sql

    # Setup Active Job to use Sidekiq
    config.active_job.queue_adapter = :sidekiq

    config.action_mailer.asset_host = Settings.asset_host || URI::Generic.build(
      host: Settings.domain, scheme: Settings.protocol || 'https',
      port: Settings.port
    ).to_s

    config.to_prepare do
      ActiveStorage::Attachment.prepend ActiveStorageCreateVariant

      Devise::Mailer.layout 'mailer/layouts/end_user_email'

      # lib/cron_jobs_loader
      CronJobsLoader.load_jobs if Sidekiq.server? && Rails.env.production?

      # lib/handlers/csv_handler
      ActionView::Template.register_template_handler :am, Handlers::CsvHandler::Handler
    end

    config.middleware.use(Middlewares::SetLocaleMiddleware)
    config.middleware.use(Middlewares::CheckSession)

    config.action_controller.raise_on_open_redirects = false

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
  end
end

# frozen_string_literal: true

require 'semantic_logger'

module SiemLogger
  class Formatter < SemanticLogger::Formatters::Json
    def call(log, _logger)
      return log.payload.to_json if siem_log?(log)

      hash = build_base_hash(log)
      enrich_request_id(hash, log)
      enrich_user_id(hash)
      deduplicate_tags(hash)

      hash.to_json
    end

    private

    def siem_log?(log)
      log.name == 'SIEM' && log.payload.is_a?(Hash)
    end

    def build_base_hash(log)
      hash = log.to_h
      payload = hash.delete(:payload) || hash.delete('payload')
      hash.merge!(payload) if payload.is_a?(Hash)
      hash[:application] = Settings.application_code
      hash[:host] = ENV.fetch('APP_DOMAIN', nil)
      hash
    end

    def enrich_request_id(hash, log)
      if log.named_tags && log.named_tags[:request_id]
        hash[:request_id] = log.named_tags[:request_id]
      end

      if hash[:request_id].blank? && defined?(Current) &&
         Current.respond_to?(:request_id) && Current.request_id.present?
        hash[:request_id] = Current.request_id
      end
    end

    def enrich_user_id(hash)
      return unless defined?(Current) && Current.respond_to?(:user) && Current.user.respond_to?(:id)

      hash[:user_id] = Current.user.id
    end

    def deduplicate_tags(hash)
      if hash[:named_tags].is_a?(Hash)
        hash[:named_tags].delete(:request_id)
        hash.delete(:named_tags) if hash[:named_tags].empty?
      end

      return unless hash[:tags] && hash[:request_id]

      hash[:tags] = hash[:tags].reject { |t| t == hash[:request_id] }
      hash.delete(:tags) if hash[:tags].empty?
    end
  end

  LOGGER = SemanticLogger['SIEM']
end

class SemanticLoggerInitializer
  class << self
    def setup
      config_defaults
      # Formatter is now loaded at top level, no need to define it here
      setup_appenders
      configure_rails_logger
    end

    private

    def config_defaults
      SemanticLogger.default_level = :debug
      $stdout.sync = true
    end

    def setup_appenders
      # Clear existing appenders to avoid Sidekiq's default stdout logger,
      # which overrides the configured JSON formatter.
      SemanticLogger.appenders.each do |appender|
        SemanticLogger.remove_appender(appender)
      end

      formatter = Settings.features.rails_log_to_json ? SiemLogger::Formatter.new : :color

      # Add STDOUT appender
      unless Rails.env.test?
        SemanticLogger.add_appender(io: $stdout, formatter: formatter)
      end

      # Add File appender ONLY in Development or Test
      if Rails.env.development? || Rails.env.test?
        async = !Rails.env.test?
        SemanticLogger.add_appender(file_name: "log/#{Rails.env}.log", formatter: formatter, async: async)
      end
    end

    def configure_rails_logger
      Rails.logger = SemanticLogger['Rails']
      ActiveRecord::Base.logger = Rails.logger
    end
  end
end

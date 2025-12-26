# frozen_string_literal: true

require 'semantic_logger'

SemanticLogger.default_level = Rails.env.production? ? :info : :debug

$stdout.sync = true

module SiemLogger
  class Formatter < SemanticLogger::Formatters::Json
    def call(log, _logger)
      if log.name == 'SIEM'
        payload = log.payload
        return payload.to_json if payload.is_a?(Hash)
      end

      hash = log.to_h
      payload = hash.delete(:payload) || hash.delete('payload')
      hash.merge!(payload) if payload.is_a?(Hash)
      hash[:application] = Settings.application_code
      hash[:host] = ENV.fetch('APP_DOMAIN', nil)
      hash.to_json
    end
  end

  LOGGER = SemanticLogger['SIEM']
end

if Settings.features.rails_log_to_json
  SemanticLogger.add_appender(io: $stdout, formatter: SiemLogger::Formatter.new)
else
  SemanticLogger.add_appender(io: $stdout, formatter: :color)
end

Rails.logger = SemanticLogger['Rails']
ActiveRecord::Base.logger = Rails.logger

ActiveSupport::Notifications.subscribe('sql.active_record') do |*args|
  event = ActiveSupport::Notifications::Event.new(*args)
  next if event.payload[:name] == 'SCHEMA'

  SemanticLogger['SQL'].debug(
    message: "#{event.payload[:name]} #{event.payload[:sql]}",
    duration: event.duration,
    binds: event.payload[:binds]
  )
end

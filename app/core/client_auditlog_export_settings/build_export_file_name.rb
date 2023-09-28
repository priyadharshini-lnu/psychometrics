# frozen_string_literal: true

module ClientAuditlogExportSettings
  class BuildExportFileName < BaseCommand
    private_attr_reader :settings, :client, :current_time

    def initialize(settings, client, current_time)
      @settings = settings
      @client = client
      @current_time = current_time
    end

    def call
      file = "#{settings.s3_bucket_folder.to_s.chomp('/')}/#{current_time.year}/#{current_time.strftime('%m')}/#{current_time.strftime('%d')}/AuditLog-#{client.id}-#{current_time.strftime('%s%L')}.json" # rubocop:disable Layout/LineLength
      broadcast :ok, file
    end
  end
end

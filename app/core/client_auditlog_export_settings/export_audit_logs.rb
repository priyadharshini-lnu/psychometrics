# frozen_string_literal: true

module ClientAuditlogExportSettings
  class ExportAuditLogs < BaseCommand
    private_attr_reader :settings, :client, :current_time

    def initialize(settings)
      @settings = settings
      @client = settings.client
      @current_time = Time.current
    end

    def call
      query = audit_logs_query

      if query.empty?
        settings.update!(last_exported_at: current_time)
        return broadcast :ok, :noop
      end

      file_name = BuildExportFileName.call!(settings, client, current_time)
      result = S3::UploadStream.call!(settings, query, file_name)
      settings.update!(last_exported_at: current_time)
      broadcast :ok, result
    end

    def audit_logs_query
      query = AuditLog.where(client: client).where('created_at <  ?', [current_time]).order(created_at: :asc)
      if settings.last_exported_at
        query = query.where('created_at >= ?', [settings.last_exported_at])
      end
      query
    end
  end
end

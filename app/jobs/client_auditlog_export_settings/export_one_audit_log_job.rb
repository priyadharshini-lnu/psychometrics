# frozen_string_literal: true

module ClientAuditlogExportSettings
  class ExportOneAuditLogJob
    include Sidekiq::Worker
    sidekiq_options queue: 'default'

    def perform(setting_id)
      setting = ClientAuditlogExportSetting.find(setting_id)
      ClientAuditlogExportSettings::ExportAuditLogs.call!(setting)
    end
  end
end

# frozen_string_literal: true

module ClientAuditlogExportSettings
  class ExportOneAuditLogJob
    include Sidekiq::Worker
    sidekiq_options queue: 'default', lock: :until_executed, lock_args_method: :lock_args

    def self.lock_args(args)
      [args[0]]
    end

    def perform(setting_id)
      setting = ClientAuditlogExportSetting.find(setting_id)
      ClientAuditlogExportSettings::ExportAuditLogs.call!(setting)
    end
  end
end

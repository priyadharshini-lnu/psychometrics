# frozen_string_literal: true

module ClientAuditlogExportSettings
  class ExportAllAuditLogsJob < ApplicationJob
    queue_as :default

    def perform
      # TODO(atanych): that potentially can raise spikes in DB performance each 15 minutes. As alternative
      # we can call it every minute and limit this query by X records
      ClientAuditlogExportSetting.active.find_each { |settings| ExportOneAuditLogJob.perform_later(settings.id) }
    end
  end
end

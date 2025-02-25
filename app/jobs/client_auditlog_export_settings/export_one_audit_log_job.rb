# frozen_string_literal: true

module ClientAuditlogExportSettings
  class ExportOneAuditLogJob < ApplicationJob
    queue_as :default
    track_exceptions(
      exception_classes: [
        Aws::S3::Errors::InvalidAccessKeyId,
        Aws::S3::Errors::InvalidBucketName,
        Aws::S3::Errors::SignatureDoesNotMatch
      ],
      consecutive_failure_count: 1
    )

    def perform(_setting_id)
      ClientAuditlogExportSettings::ExportAuditLogs.call!(export_setting)
    end

    private

    # Required by track_exceptions before perform
    def setting_id
      arguments.first
    end

    def export_setting
      @export_setting ||= ClientAuditlogExportSetting.find(setting_id)
    end

    def identfier_args
      {
        identifier: [self.class.name, export_setting.to_global_id.to_s].join('/'),
        resource: export_setting
      }
    end
  end
end

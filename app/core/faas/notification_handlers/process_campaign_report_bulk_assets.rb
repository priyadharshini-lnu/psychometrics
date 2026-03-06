# frozen_string_literal: true

module Faas
  module NotificationHandlers
    class ProcessCampaignReportBulkAssets < Base
      def call
        campaign_report = CampaignReport.find_by(id: data['campaign_report_id'])

        return broadcast :ok unless campaign_report

        admin_job = AdminJobRecord.find_by(id: data['admin_job_record_id'])
        if admin_job && data['status'] == 'failed'
          admin_job.update!(status: :failed, error_messages: [data['error']])
          campaign_report.bulk_assets_zip.purge_later
          campaign_report.bulk_assets_csv.purge_later
          return broadcast :ok
        end

        if data['status'] == 'completed'
          ::CampaignReports::ProcessExtractedFiles.call!(campaign_report, data, admin_job)
        end
      end
    end
  end
end

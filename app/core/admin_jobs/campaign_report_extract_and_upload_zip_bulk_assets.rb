# frozen_string_literal: true

module AdminJobs
  class CampaignReportExtractAndUploadZipBulkAssets < AdminJobs::Base
    def call
      ::CampaignReports::ExtractBulkAssets.call!(
        campaign_report,
        owner,
        record
      )

      broadcast :waiting
    end

    def valid?
      campaign_report.present?
    end

    def generate_title_link
      {
        href: campaign_report.bulk_assets_zip.url,
        label: "#{campaign_report.report.name} - Bulk Assets"
      }
    end

    def campaign_report
      @campaign_report ||= CampaignReport.find_by(id: record.data['campaign_report_id'])
    end

    def generate_details
      [
        [I18n.t('admin.campaign_name'), campaign_report.campaign.name],
        [I18n.t('admin.report_name'), campaign_report.report.name]
      ]
    end
  end
end

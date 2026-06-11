# frozen_string_literal: true

module AdminJobs
  class BulkDownloadReports < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      result = ::CampaignReports::BulkDownload.call(campaign_reports: campaign_reports, current_user: owner,
                                                    job_record: record)

      bulk_report = result[:ok]

      # case where bulk_report is a hash with error messages
      if bulk_report.is_a?(Hash) && bulk_report[:error_messages].present?
        return broadcast :ok, { error_messages: bulk_report[:error_messages] }
      end

      if bulk_report
        content = build_download_content(bulk_report)
        broadcast :ok, { content: content }
      end

      broadcast :waiting
    end

    def valid?
      campaign.present? && campaign_reports.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{campaign_reports.first.report.name} (...)"
      }
    end

    def generate_details
      [
        [I18n.t('administration.reports.name'), campaign_reports.map { |cr| cr.report.name }.join(', ')]
      ]
    end

    private

    def campaign_reports
      @campaign_reports ||= campaign.campaign_reports.includes(:report).where(id: record.data['ids'])
    end
  end
end

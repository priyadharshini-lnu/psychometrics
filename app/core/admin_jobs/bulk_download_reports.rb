# frozen_string_literal: true

module AdminJobs
  class BulkDownloadReports < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      campaign_reports = campaign.campaign_reports.where(id: record.data['ids'])
      bulk_report = ::CampaignReports::BulkDownload.call!(campaign_reports, owner, record)

      content = [
        content_tag(:div, I18n.t('admin_jobs.bulk_download_reports.content.title')),
        content_tag(:ul) do
          bulk_report.files.map do |file|
            content_tag(:li) do
              content_tag(:a, file.store_dir, href: file.url)
            end
          end.join.html_safe
        end
      ].join.html_safe

      broadcast :ok, { content: content }
    end

    private

    def campaign
      Campaign.find(record.data['campaign_id'])
    end
  end
end

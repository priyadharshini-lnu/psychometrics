# frozen_string_literal: true

module AdminJobs
  class BulkDownloadReports < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      result = ::CampaignReports::BulkDownload.call(campaign_reports: campaign_reports, current_user: owner,
                                                    job_record: record)

      bulk_report = result[:ok]

      if bulk_report&.dig(:error_messages)&.present?
        return broadcast :ok, { error_messages: bulk_report[:error_messages] }
      end

      if bulk_report
        content = [
          content_tag(:div, I18n.t('admin_jobs.bulk_download_reports.content.title')),
          content_tag(:ul) do
            bulk_report.files.map.with_index do |file, index|
              content_tag(:li) do
                url = Utility::Url.generate(:download_administration_bulk_report_url, id: bulk_report.id, index: index)
                content_tag(:a, file.filename.to_s, href: url)
              end
            end.join.html_safe
          end
        ].join.html_safe

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
      @campaign_reports ||= campaign.campaign_reports.where(id: record.data['ids'])
    end
  end
end

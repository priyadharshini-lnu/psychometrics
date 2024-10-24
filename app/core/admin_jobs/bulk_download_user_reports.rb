# frozen_string_literal: true

module AdminJobs
  class BulkDownloadUserReports < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      result = ::CampaignReports::BulkDownload.call(
        user_reports: user_reports.joins(:pdf_file_attachment),
        current_user: owner,
        job_record: record
      )

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

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/participants/subjects/#{user.id}",
        label: "#{campaign.name} - #{user.decorate.full_name}"
      }
    end

    def generate_details
      [
        [I18n.t('administration.users.user'), user.decorate.full_name],
        [I18n.t('administration.reports.name'), user_reports.map { |cr| cr.report.name }.join(', ')]
      ]
    end

    def valid?
      campaign.present? && user_reports.present? && user.present?
    end

    private

    def user_reports
      @user_reports ||= campaign.user_reports.where(id: record.data['ids'])
    end

    def user
      @user ||= user_reports.first&.user
    end
  end
end

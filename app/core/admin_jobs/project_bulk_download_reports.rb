# frozen_string_literal: true

module AdminJobs
  class ProjectBulkDownloadReports < AdminJobs::Base
    def call
      result = ::Projects::BulkDownload.call(
        current_user:  owner,
        job_record:    record,
        project_name:  project_name
      )

      bulk_report = result[:ok]

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
      record.data['campaign_ids'].present? && record.data['selected_reports'].present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{record.data['project_id']}/bulk_reports",
        label: "Project bulk download reports — #{project_name}"
      }
    end

    def generate_details
      [
        [I18n.t('admin.project_id'), record.data['project_id'].to_s],
        [I18n.t('admin.campaigns'), Array(record.data['campaign_ids']).join(', ')],
        [I18n.t('admin.reports'), selected_report_ids.join(', ')]
      ]
    end

    def build_download_content(_bulk_report)
      project_id         = record.data['project_id']
      bulk_report_job_id = record.data['bulk_report_job_id']
      url = "/admin/projects/#{project_id}/bulk_reports/#{bulk_report_job_id}"
      content_tag(:a, I18n.t('admin.bulk_reports_view_downloads'), href: url)
    end

    private

    def project_name
      project&.name || "Project #{record.data['project_id']}"
    end

    def selected_report_ids
      @selected_report_ids ||= (record.data['selected_reports'] || {}).keys
    end

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end

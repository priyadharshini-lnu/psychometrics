# frozen_string_literal: true

module AdminJobs
  class ExportReportData < AdminJobs::Base
    include ActionView::Helpers::TagHelper
    include ActionView::Context

    def call
      xlsx = ::Reports::ExportData.call!(report, campaign)
      directory = Rails.root.join('tmp', 'report_export_data', record.id.to_s)
      FileUtils.mkdir_p(directory)
      file_path = directory.join("#{report.name}-export.xlsx")
      xlsx.serialize(file_path)
      record.update(file: File.open(file_path))

      broadcast :ok
    end

    def valid?
      campaign.present? && report.present?
    end

    def generate_title_link
      {
        href: "/administration/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{report.name}"
      }
    end

    def generate_details
      file_link = content_tag(:a, record.file.filename, href: record.file.url) if record.file.present?
      [
        [I18n.t('administration.reports.name'), file_link || report.name]
      ]
    end

    private

    def report
      @report ||= Report.find_by(id: record.data['report_id'])
    end
  end
end

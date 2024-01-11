# frozen_string_literal: true

module AdminJobs
  class ExportReportData < AdminJobs::BaseExportXlsx
    def valid?
      campaign.present? && report.present?
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/assessments_reports/manage",
        label: "#{campaign.name} - #{report.name}"
      }
    end

    def generate_details
      [[I18n.t('common.model.report'), file_link || report.name]]
    end

    private

    def xlsx
      ::Reports::ExportData.call!(report, campaign)
    end

    def file_name
      "report-#{report.id}-data.xlsx"
    end

    def report
      @report ||= Report.find_by(id: record.data['report_id'])
    end
  end
end

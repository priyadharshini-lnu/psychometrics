# frozen_string_literal: true

module AdminJobs
  class RemapReportAssessment < AdminJobs::Base
    def call
      report = Report.find(record.data['report_id'])
      ::Administration::Reports::RemapAssessment.call!(report, record.data['current_assessment_id'],
                                                       record.data['new_assessment_id'])
      broadcast :ok
    end

    def generate_title_link
      {
        href: "/administration/reports/#{report.id}",
        label: report.name.to_s
      }
    end

    def generate_details
      [
        [I18n.t('common.column.report'), report.name]
      ]
    end

    def valid?
      report.present?
    end

    private

    def report
      @report ||= Report.find_by(id: record.data['report_id'])
    end
  end
end

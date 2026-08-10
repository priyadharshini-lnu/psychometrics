# frozen_string_literal: true

module AdminJobs
  class CopyReport < AdminJobs::Base
    def call
      result = ::Reports::CopyReport.call(
        record.data['report_id'],
        owner,
        record.data['owner_id'],
        new_report_name: record.data['name'],
        skip_owner_validation: record.data.fetch('skip_owner_validation', false)
      )

      if result[:ok]
        record.update(data: record.data.merge(new_report_id: result[:ok].id))
        broadcast :ok
      else
        broadcast :error, I18n.t('admin_jobs.copy_report.failed')
      end
    end

    def generate_title_link
      report = Report.find_by(id: record.data['new_report_id'])
      return {} unless report

      {
        href: "/administration/reports/#{report.id}",
        label: report.name
      }
    end

    def valid?
      Report.exists?(id: record.data['report_id'])
    end
  end
end

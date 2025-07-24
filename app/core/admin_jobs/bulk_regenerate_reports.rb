# frozen_string_literal: true

module AdminJobs
  class BulkRegenerateReports < AdminJobs::Base
    def call
      user_reports = campaign_reports.map(&:user_reports).flatten
      options = {
        low_priority: true,
        force_regenerate: true,
        selected_reports: record.data['selected_reports'] || {}
      }
      ::UserReports::GenerateAndSavePdf.call!(user_reports, owner, options, record)

      broadcast :waiting
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

    def valid?
      campaign.present? && campaign_reports.present?
    end

    private

    def campaign_reports
      @campaign_reports ||= campaign&.campaign_reports&.includes(:report)&.where(id: record.data['ids'])
    end
  end
end

# frozen_string_literal: true

module AdminJobs
  class BulkRegenerateUserReports < AdminJobs::Base
    def call
      ::UserReports::GenerateAndSavePdf.call!(user_reports, owner, options, record)

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
      @user_reports ||= campaign&.user_reports&.includes(:report)&.where(
        report_id: selected_reports.keys, user_id: record.data['user_id']
      )
    end

    def selected_reports
      record.data['selected_reports'] || {}
    end

    def options
      {
        selected_reports: selected_reports,
        force_regenerate: true
      }
    end

    def user
      @user ||= User.find_by(id: record.data['user_id'])
    end
  end
end

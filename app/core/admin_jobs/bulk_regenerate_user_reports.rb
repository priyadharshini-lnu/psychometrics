# frozen_string_literal: true

module AdminJobs
  class BulkRegenerateUserReports < AdminJobs::Base
    def call
      ::UserReports::GenerateAndSavePdf.call!(user_reports, owner, {}, record)

      broadcast :waiting
    end

    def generate_title_link
      {
        href: "/admin/projects/#{campaign.project_id}/new_campaigns/#{campaign.id}/participants/users/#{user.id}",
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
      @user_reports ||= campaign&.user_reports&.where(id: record.data['ids'])
    end

    def user
      @user ||= user_reports.first&.user
    end
  end
end

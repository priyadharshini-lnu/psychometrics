# frozen_string_literal: true

module ReportApproving
  class ApprovalNotificationDigestMailer < ApplicationMailer
    layout 'admin_email'

    def notify(report_ids, user_id)
      return if report_ids.empty?

      @user = User.find_by(id: user_id)
      @reports = UserReport.where(id: report_ids)

      @campaign = @reports.first.campaign
      @report = @reports.first.report
      @project = @campaign.project
      @url = administration_report_approvals_all_url(
        'my_tasks',
        q: {
          filter: {
            report_id_in: [@report.id],
            campaign_id_in: [@campaign.id]
          }
        }
      )

      send_email(
        @user,
        from: "#{t('mailer.from')} <no-reply@#{Settings.domain}>",
        subject: 'Reports approved',
        template_path: 'mailer/report_approving',
        template_name: 'approval_notification_digest'
      )
    end
  end
end

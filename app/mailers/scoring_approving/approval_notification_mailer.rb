# frozen_string_literal: true

module ScoringApproving
  class ApprovalNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(score_approval, user)
      @score_approval = score_approval
      @user = user
      @project = @score_approval.project
      @url = admin_all_url('ai_scoring_approvals/approved')

      send_email(
        user,
        subject: 'Scoring approved',
        template_path: 'mailer/scoring_approving',
        template_name: 'approval_notification',
        **admin_sender_attributes(@score_approval.project&.client)
      )
    end
  end
end

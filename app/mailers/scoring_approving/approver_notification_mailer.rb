# frozen_string_literal: true

module ScoringApproving
  class ApproverNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(score_approval, user)
      @score_approval = score_approval
      @user = user
      @project = @score_approval.project
      @url = administration_ai_scoring_approvals_all_url("#{@score_approval.id}/review")

      send_email(
        user,
        subject: 'Scoring approval required',
        template_path: 'mailer/scoring_approving',
        template_name: 'approver_notification',
        **admin_sender_attributes(@score_approval.project&.client)
      )
    end
  end
end

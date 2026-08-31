# frozen_string_literal: true

module ScoringApproving
  class AssessorNotificationMailer < ApplicationMailer
    layout 'admin_email'

    def notify(score_approval, user)
      @score_approval = score_approval
      @user = user
      @project = @score_approval.project
      @setting = @score_approval.setting
      @review_role = @setting&.one_level_approve? ? 'approver' : 'assessor'
      @review_stage = @setting&.one_level_approve? ? 'approval' : 'QC'
      @url = admin_all_url("ai_scoring_approvals/#{@score_approval.id}/review")

      send_email(
        user,
        subject: "Scoring ready for #{@review_stage}",
        template_path: 'mailer/scoring_approving',
        template_name: 'assessor_notification',
        **admin_sender_attributes(@score_approval.project&.client)
      )
    end
  end
end

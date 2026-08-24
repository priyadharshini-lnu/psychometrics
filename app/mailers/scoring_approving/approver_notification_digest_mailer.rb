# frozen_string_literal: true

module ScoringApproving
  class ApproverNotificationDigestMailer < ApplicationMailer
    layout 'admin_email'

    def notify(score_approval_ids, user_id)
      return if score_approval_ids.empty?

      @user = User.find_by(id: user_id)
      @score_approvals = AI::ScoreApproval.where(id: score_approval_ids)

      @campaign = @score_approvals.first.campaign
      @assessment = @score_approvals.first.assessment
      @project = @campaign.project
      @url = admin_all_url(
        'ai_scoring_approvals/my_tasks',
        q: {
          filter: {
            assessment_id_in: [@assessment.id],
            campaign_id_in: [@campaign.id]
          }
        }
      )

      send_email(
        @user,
        subject: I18n.t('admin.ai_scoring_approval_digest_mailer_awaiting_subject'),
        template_path: 'mailer/scoring_approving',
        template_name: 'approver_notification_digest',
        **admin_sender_attributes(@project&.client)
      )
    end
  end
end

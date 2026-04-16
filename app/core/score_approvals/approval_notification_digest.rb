# frozen_string_literal: true

module ScoreApprovals
  class ApprovalNotificationDigest < BaseCommand
    def initialize(score_approval_ids, campaign_id, assessment_id)
      @score_approval_ids = score_approval_ids
      @approval_setting = AI::ScoringApprovalSetting.find_by(
        campaign_id: campaign_id, assessment_id: assessment_id
      )
    end

    def call
      approval_notification_user_ids = @approval_setting&.approval_notification_user_ids
      return if approval_notification_user_ids.blank?

      approval_notification_user_ids.each do |user_id|
        ::ScoringApproving::ApprovalNotificationDigestMailer.notify(@score_approval_ids, user_id).deliver_later
      end
      @approval_setting.update!(last_digest_sent_at: Time.current)
    end
  end
end

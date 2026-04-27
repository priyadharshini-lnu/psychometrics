# frozen_string_literal: true

module ScoreApprovals
  class ApproverNotificationDigest < BaseCommand
    def initialize(score_approval_ids, campaign_id, assessment_id)
      @score_approval_ids = score_approval_ids
      @approval_setting = AI::ScoringApprovalSetting.find_by(
        campaign_id: campaign_id, assessment_id: assessment_id
      )
    end

    def call
      approver_ids = @approval_setting&.approver_ids
      return if approver_ids.blank?

      approver_ids.each do |user_id|
        ::ScoringApproving::ApproverNotificationDigestMailer.notify(@score_approval_ids, user_id).deliver_later
      end
      @approval_setting.update!(last_digest_sent_at: Time.current)
    end
  end
end

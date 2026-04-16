# frozen_string_literal: true

class SendScoringDigestEmailsJob < ApplicationJob
  def perform(score_approval_ids, campaign_id, assessment_id, new_status)
    case new_status
      when 'approver_approved'
        ::ScoreApprovals::ApprovalNotificationDigest.call!(score_approval_ids, campaign_id, assessment_id)
      when 'assessor_approved'
        ::ScoreApprovals::ApproverNotificationDigest.call!(score_approval_ids, campaign_id, assessment_id)
    end
  end
end

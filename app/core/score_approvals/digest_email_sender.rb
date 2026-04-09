# frozen_string_literal: true

module ScoreApprovals
  class DigestEmailSender
    def self.send_for(setting)
      return if setting.do_not_send_notifications
      return if setting.digest_emails_enabled_at.blank?

      score_approvals = AI::ScoreApproval.where(
        campaign_id: setting.campaign_id,
        assessment_id: setting.assessment_id,
        approval_status_updated_at: after_last_digest(setting)
      )
      return if score_approvals.empty?

      assessor_approved = score_approvals.where(approval_status: 'assessor_approved').pluck(:id)
      approver_approved = score_approvals.where(approval_status: 'approver_approved').pluck(:id)

      if assessor_approved.any?
        SendScoringDigestEmailsJob.perform_later(
          assessor_approved,
          setting.campaign_id,
          setting.assessment_id,
          'assessor_approved'
        )
      end

      if approver_approved.any?
        SendScoringDigestEmailsJob.perform_later(
          approver_approved,
          setting.campaign_id,
          setting.assessment_id,
          'approver_approved'
        )
      end
    end

    def self.after_last_digest(setting)
      if setting.last_digest_sent_at.present?
        [setting.last_digest_sent_at, setting.digest_emails_enabled_at].max..Time.current
      else
        setting.digest_emails_enabled_at..Time.current
      end
    end
  end
end

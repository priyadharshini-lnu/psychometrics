# frozen_string_literal: true

class SendDigestEmailsJob < ApplicationJob
  def perform(report_ids, campaign_id, report_id, new_status)
    case new_status
      when 'approved'
        ::UserReports::ApprovalNotificationDigest.call!(report_ids, campaign_id, report_id)
      when 'qc_completed'
        ::UserReports::ApproverNotificationDigest.call!(report_ids, campaign_id, report_id)
    end
  end
end

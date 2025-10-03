# frozen_string_literal: true

module ReportApprovals
  class DigestEmailSender
    def self.send_for(setting)
      return if settings.do_not_send_notifications

      reports = setting.report.user_reports.where(
        approval_status_updated_at: after_last_digest(setting)
      )
      return if reports.empty?

      qc_completed = reports.where(approval_status: 'qc_completed').pluck(:id)
      approved     = reports.where(approval_status: 'approved').pluck(:id)

      if qc_completed.any?
        SendDigestEmailsJob.perform_later(
          qc_completed,
          setting.campaign_id,
          setting.report_id,
          'qc_completed'
        )
      end

      if approved.any?
        SendDigestEmailsJob.perform_later(
          approved,
          setting.campaign_id,
          setting.report_id,
          'approved'
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

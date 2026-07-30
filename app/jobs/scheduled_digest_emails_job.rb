# frozen_string_literal: true

class ScheduledDigestEmailsJob < ApplicationJob
  def perform
    ReportApprovalSetting.where(send_digest_emails: true, digest_delivery_mode: 'scheduled').find_each do |setting|
      next unless due_for_digest?(setting)

      ::ReportApprovals::DigestEmailSender.send_for(setting)
    end

    AI::ScoringApprovalSetting.where(send_digest_emails: true, digest_delivery_mode: 'scheduled').find_each do |setting|
      next unless due_for_digest?(setting)

      ::ScoreApprovals::DigestEmailSender.send_for(setting)
    end
  end

  private

  def due_for_digest?(setting)
    return false if setting.digest_emails_enabled_at.blank?

    normalized_tz = TimezoneHelper.normalize(setting.digest_timezone)
    now         = Time.current.in_time_zone(normalized_tz)
    last_sent   = setting.last_digest_sent_at
    target_time = now.change(
      hour: setting.digest_time.hour,
      min:  setting.digest_time.min
    )

    return false unless due_today?(setting, now)
    return false unless due_now?(now, target_time)
    return true if last_sent.nil?

    last_sent < target_time
  end

  def due_today?(setting, now)
    case setting.digest_frequency
      when 'daily'
        true
      when 'weekly', 'weekdays'
        setting.digest_weekdays.include?(now.wday)
      else
        false
    end
  end

  def due_now?(now, target_time)
    now >= target_time && now < target_time + 10.minutes
  end
end

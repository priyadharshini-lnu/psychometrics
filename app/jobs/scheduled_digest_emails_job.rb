# frozen_string_literal: true

class ScheduledDigestEmailsJob < ApplicationJob
  def perform
    ReportApprovalSetting.where(send_digest_emails: true, digest_delivery_mode: 'scheduled').find_each do |setting|
      next unless due_for_digest?(setting)

      reports = setting.report.user_reports.where(
        approval_status_updated_at: after_last_digest(setting)
      )

      next if reports.empty?

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
  end

  private

  def due_for_digest?(setting)
    now         = Time.current.in_time_zone(setting.digest_timezone)
    last_sent   = setting.last_digest_sent_at
    target_time = now.change(
      hour: setting.digest_time.hour,
      min:  setting.digest_time.min
    )

    return false unless due_today?(setting, now)
    return false unless due_now?(now, target_time)
    return true if last_sent.nil?

    last_sent < now
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

  def after_last_digest(setting)
    if setting.last_digest_sent_at.present?
      setting.last_digest_sent_at..Time.current
    else
      # fallback: all history until now
      Time.zone.at(0)..Time.current
    end
  end

  def in_time_window?(now, target_time)
    now >= target_time && now < target_time + 10.minutes
  end
end

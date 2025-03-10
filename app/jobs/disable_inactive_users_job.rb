# frozen_string_literal: true

class DisableInactiveUsersJob < ApplicationJob
  INACTIVITY_WARNING_DAYS = 80
  ACCOUNT_DISABLE_DAYS = 90

  def perform
    handle_inactivity_warning
    handle_account_disabling
  end

  private

  def handle_inactivity_warning
    User.superadmins.
      where(last_sign_in_at: INACTIVITY_WARNING_DAYS.days.ago.all_day).
      where.not(disabled: true).
      each_with_index do |user, index|
      UserMailer.inactivity_warning(user).deliver_later(wait: index.minutes)
      audit_inactivity_warning_email_sent(user)
    rescue StandardError => e
      Rails.logger.error "Failed to send inactivity warning email to #{user.email}: #{e.message}"
    end
  end

  def handle_account_disabling
    User.superadmins.
      where('last_sign_in_at <= ?', ACCOUNT_DISABLE_DAYS.days.ago).
      where.not(disabled: true).
      each_with_index do |user, index|
      full_name = user.decorate.full_name
      email = user.email
      UserMailer.account_disabled(full_name, email).deliver_later(wait: index.minutes)
      audit_account_disabled_email_sent(user)

      user.update!(disabled: true, disabled_at: Time.current)
      audit_account_disabled(user)
    rescue StandardError => e
      Rails.logger.error "Failed to disable account for #{user.email}: #{e.message}"
    end
  end

  def audit_inactivity_warning_email_sent(user)
    AuditLogModule.audit!(
      :inactivity_warning_email_sent,
      user,
      user: user,
      payload: {}
    )
  end

  def audit_account_disabled_email_sent(user)
    AuditLogModule.audit!(
      :account_disabled_email_sent,
      user,
      user: user,
      payload: {}
    )
  end

  def audit_account_disabled(user)
    AuditLogModule.audit!(
      :account_disabled,
      user,
      user: user,
      payload: {}
    )
  end
end

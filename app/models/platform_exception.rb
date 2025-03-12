# frozen_string_literal: true

class PlatformException < ApplicationRecord
  DEFAULT_NOTIFICATION_COOLDOWN = 24.hours

  belongs_to :resource, polymorphic: true

  validates :identifier, presence: true

  def handle_exception!(exception, threshold)
    increment_failure_count!(exception)

    if consecutive_failure_count > threshold
      notify_admins! if should_send_notification?
      raise SuppressedExceptionError.new(exception, self)
    end

    raise exception
  end

  def reset_counter!
    update!(consecutive_failure_count: 0)
  end

  private

  def increment_failure_count!(exception)
    transaction do
      self.consecutive_failure_count += 1
      self.meta = {
        exception_class: exception.class.name,
        error_message: exception.message,
        backtrace: exception.backtrace&.first(20)&.join("\n")
      }
      save!
    end
  end

  def should_send_notification?
    last_notified_at.nil? || last_notified_at < DEFAULT_NOTIFICATION_COOLDOWN.ago
  end

  def notify_admins!
    emails = Settings.platform_admins&.split(',')&.map(&:strip)
    if emails.present?
      PlatformExceptionMonitorMailer.
        send_platform_exception_suppressed_notification(emails, self).deliver_later
    end

    touch(:last_notified_at)
  end
end

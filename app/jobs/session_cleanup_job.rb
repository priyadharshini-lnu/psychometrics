# frozen_string_literal: true

class SessionCleanupJob < ApplicationJob
  queue_as :cron_tasks

  # Clean up sessions older than 30 days
  def perform
    deleted_count = Session.cleanup_old_sessions(older_than: 30.days.ago)
    Rails.logger.info "[SessionCleanup] Deleted #{deleted_count} old sessions"
  end
end

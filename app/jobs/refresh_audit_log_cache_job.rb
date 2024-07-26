# frozen_string_literal: true

class RefreshAuditLogCacheJob < ApplicationJob
  queue_as :default

  def perform(*_args)
    # Fetch distinct record types and actions
    distinct_record_types = AuditLog.distinct.pluck(:record_type).compact.sort
    distinct_actions = AuditLog.distinct.pluck(:action).compact.sort

    # Store them in cache
    Rails.cache.write('audit_log_record_types', distinct_record_types, expires_in: 24.hours)
    Rails.cache.write('audit_log_actions', distinct_actions, expires_in: 24.hours)
  end
end

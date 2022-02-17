# frozen_string_literal: true

require 'kaminari'

module AuditLogModule
  class << self
    def audit!(action, record, options = {})
      campaign = options[:campaign]
      project = options[:project] || campaign&.project
      client = options[:client] || project&.client || campaign&.client
      payload = options[:payload]
      user = options[:user]
      request = options[:request]

      request_info = {}
      if request
        request_info = {
          request_id: request.try(:request_id),
          ip: request.try(:ip) || request.remote_ip,
          url: request.url,
          user_agent: request.user_agent
        }
      end

      Rails.logger.silence do
        AuditLog.create!(
          action: action,
          record_id: record&.id,
          record_type: record&.class&.name,
          client_id: client&.id,
          project_id: project&.id,
          campaign_id: campaign&.id,
          payload: (payload || {}).to_enum.to_h,
          user: user,
          request: request_info.to_h
        )
      end
    end
  end
end

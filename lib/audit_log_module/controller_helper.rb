# frozen_string_literal: true

module AuditLogModule
  module ControllerHelper
    def audit!(action, record, options = {})
      options[:user] ||= current_user
      options[:request_details] ||= request_details_to_log
      AuditLogModule.audit!(action, record, options)
    end

    def request_details_to_log
      {
        request_id: request.try(:request_id),
        ip: request.remote_ip,
        url: request.url
      }
    end
  end
end

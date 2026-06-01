# frozen_string_literal: true

module AuditLogModule
  module ControllerHelper
    def audit!(action, record, options = {})
      options[:user] ||= current_user
      options[:impersonated_by_id] ||= session[:impersonated_by_id] if respond_to?(:session)
      options[:request_details] ||= request_details_to_log
      options[:interface_details] ||= interface_to_log
      AuditLogModule.audit!(action, record, options)
    end

    def request_details_to_log
      {
        request_id: request.try(:request_id),
        ip: request.remote_ip,
        url: request.url
      }
    end

    def interface_to_log
      {
        interface: request.env['interface'],
        user_agent: request&.user_agent
      }
    end
  end
end

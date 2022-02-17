# frozen_string_literal: true

module AuditLogModule
  module ControllerHelper
    def audit!(action, record, options = {})
      options[:user] ||= current_user
      AuditLogModule.audit!(action, record, options)
    end
  end
end

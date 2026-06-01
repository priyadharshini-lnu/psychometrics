# frozen_string_literal: true

require 'kaminari'

module AuditLogModule
  class << self
    def audit!(action, record, options = {}) # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      campaign = options[:campaign] || record.try(:campaign)
      project = options[:project] || campaign&.project
      client = options[:client] || project&.client || campaign&.client
      payload = options[:payload]
      user = options[:user]

      campaign_id = campaign&.persisted? ? campaign.id : nil
      project_id = project&.persisted? ? project.id : nil
      client_id = client&.persisted? ? client.id : nil

      if Rails.logger.respond_to?(:silence)
        Rails.logger.silence do
          AuditLog.create!(
            action: action,
            record_id: record&.id,
            record_type: record&.class&.name || options[:record_type],
            client_id: client_id,
            project_id: project_id,
            campaign_id: campaign_id,
            payload: (payload || {}).to_enum.to_h,
            user: user,
            impersonated_by_id: options[:impersonated_by_id],
            request_uuid: options.dig(:request_details, :request_id),
            client_ip: options.dig(:request_details, :ip),
            interface: options.dig(:interface_details, :interface) || 'browser',
            user_agent: options.dig(:interface_details, :user_agent),
            request: options[:request_details],
            outcome: options[:outcome] || 1,
            failure_reason: options[:failure_reason]
          )
        end
      end
    end
  end
end

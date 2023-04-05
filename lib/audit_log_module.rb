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

      if Rails.logger.respond_to?(:silence)
        Rails.logger.silence do
          AuditLog.create!(
            action: action,
            record_id: record&.id,
            record_type: record&.class&.name || options[:record_type],
            client_id: client&.id,
            project_id: project&.id,
            campaign_id: campaign&.id,
            payload: (payload || {}).to_enum.to_h,
            user: user,
            request: options[:request_details]
          )
        end
      end
    end
  end
end

# frozen_string_literal: true

module OracleAnalytics
  class ClearInactiveUsersJob < ApplicationJob
    def perform
      inactive_oracle_credentials = OracleCredential.includes(:user).where('last_accessed_at < ?', 30.days.ago)

      inactive_oracle_credentials.each do |oracle_credential|
        OracleAnalytics::DeleteUser.call!(oracle_credential.user)
      rescue StandardError => e
        Rails.logger.error("Failed to delete oracle idcs user. Error: #{e}")
      end
    end
  end
end

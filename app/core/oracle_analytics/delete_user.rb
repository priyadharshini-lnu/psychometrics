# frozen_string_literal: true

module OracleAnalytics
  class DeleteUser < Base
    private_attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      return broadcast :ok if oracle_credential.blank?

      response = client.delete("/admin/v1/Users/#{oracle_credential.idcs_user_id}")

      if response.status != 204
        Rails.logger.error("Failed to delete user. Error: #{response}")
        return broadcast :error, response
      end

      oracle_credential.destroy

      broadcast :ok
    end

    private

    def oracle_credential
      @oracle_credential ||= user.oracle_credential
    end
  end
end

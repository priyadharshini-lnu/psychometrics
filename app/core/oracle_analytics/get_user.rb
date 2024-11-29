# frozen_string_literal: true

module OracleAnalytics
  class GetUser < Base
    private_attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      return broadcast :ok if oracle_credential.blank?

      response = client.get("/admin/v1/Users/#{oracle_credential.idcs_user_id}")

      response_body = JSON.parse(response.body)

      if response.status != 200
        Rails.logger.error("Failed to get user. Error: #{response}")
        return broadcast :error, response
      end

      broadcast :ok, response_body
    end

    private

    def oracle_credential
      @oracle_credential ||= user.oracle_credential
    end
  end
end

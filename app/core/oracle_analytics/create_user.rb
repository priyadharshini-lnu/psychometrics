# frozen_string_literal: true

module OracleAnalytics
  class CreateUser < Base
    private_attr_reader :user

    def initialize(user)
      @user = user
    end

    def call
      response = client.post('/admin/v1/Users', user_payload)

      response_body = JSON.parse(response.body)

      if response.status != 201
        Rails.logger.error("Failed to create user. Error: #{response.body}")
        return broadcast :error, response_body
      end

      oracle_credential = save_oracle_credential(response_body)
      add_user_to_group(oracle_credential)

      broadcast :ok, oracle_credential
    end

    private

    def save_oracle_credential(response_body)
      OracleCredential.create!(
        user: user,
        idcs_user_id: response_body['id'],
        idcs_user_name: response_body['userName']
      )
    end

    def add_user_to_group(oracle_credential)
      OracleAnalytics::AddUserToGroup.call(oracle_credential)
    end

    def user_payload
      {
        schemas: [
          'urn:ietf:params:scim:schemas:core:2.0:User'
        ],
        userName: "#{ENV.fetch('REAL_ENV', nil)}-#{@user.id}",
        userType: 'Temp',
        active: true,
        name: {
          familyName: @user.last_name,
          givenName: @user.first_name
        },
        emails: [
          {
            value: config[:oac_default_user_email],
            type: 'work',
            primary: true
          }
        ]
      }.to_json
    end
  end
end

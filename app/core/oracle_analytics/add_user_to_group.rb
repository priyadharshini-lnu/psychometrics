# frozen_string_literal: true

module OracleAnalytics
  class AddUserToGroup < Base
    private_attr_reader :oracle_credential

    def initialize(oracle_credential)
      @oracle_credential = oracle_credential
    end

    def call
      response = client.patch("/admin/v1/Groups/#{analytics_viewers_group_id}", group_update_params)

      if response.status != 200
        Rails.logger.error("Failed to add user to analytics_viewers_group. Error: #{response.body}")
        return broadcast :error, response.body
      end

      broadcast :ok
    end

    private

    def group_update_params
      {
        schemas: [
          'urn:ietf:params:scim:api:messages:2.0:PatchOp'
        ],
        Operations: [
          {
            op: 'add',
            path: 'members',
            value: [
              {
                value: oracle_credential.idcs_user_id,
                type: 'User'
              }
            ]
          }
        ]
      }.to_json
    end

    def analytics_viewers_group_id
      config[:analytics_viewers_group_id]
    end
  end
end

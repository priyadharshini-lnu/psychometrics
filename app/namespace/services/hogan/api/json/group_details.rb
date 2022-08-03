# frozen_string_literal: true

module Services
  module Hogan
    module Api
      module Json
        class GroupDetails < Base
          def call
            response = get(
              endpoint: "Clients/#{get_client_id(context.provider)}/Groups/#{context.group}",
              request: { ClientUserId: get_client_user_id(context.provider) },
              provider: context.provider
            )
            response[:status] == 200 ? broadcast(:ok, response) : broadcast(:error, response[:body])
          end
        end
      end
    end
  end
end

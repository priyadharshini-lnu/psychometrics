# frozen_string_literal: true

module Services
  module Hogan
    module Api
      module Json
        class CreateGroup < Base
          def call
            response = post(
              endpoint: "Clients/#{get_client_id(context.provider)}/Groups",
              request: { ClientUserId: get_client_user_id(context.provider), groupName: context.group },
              provider: context.provider
            )
            success_response?(response) ? broadcast(:ok, response) : broadcast(:error, response[:body])
          end
        end
      end
    end
  end
end

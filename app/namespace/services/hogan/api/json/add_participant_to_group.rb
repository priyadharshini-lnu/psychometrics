# frozen_string_literal: true

module Services
  module Hogan
    module API
      module JSON
        class AddParticipantToGroup < Base
          def call
            response = post(
              endpoint: "Clients/#{get_client_id(context.provider)}/Groups/#{context.group}/Participants",
              request: {
                ClientUserId: get_client_user_id(context.provider),
                groupName: context.group,
                numberOfParticipants: 1,
                setGroupOptions: false,
                password: context.password
              },
              provider: context.provider
            )
            context.response = response[:body]

            if response[:status] == 200 && participant_id
              broadcast(:ok, participant_id)
            else
              broadcast(:error, response)
            end
          end

          def participant_id
            context.response.dig('participants', 0, 'participantId')
          end
        end
      end
    end
  end
end

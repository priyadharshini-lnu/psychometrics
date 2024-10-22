# frozen_string_literal: true

module Services
  module Hogan
    module Api
      module Json
        class ParticipantReport < Base
          def call
            response = get(
              # rubocop:disable Layout/LineLength
              endpoint: "Clients/#{get_client_id(context.provider)}/Groups/#{context.group}/Participants/#{context.participant_id}/Reports/#{context.report_id}",
              # rubocop:enable Layout/LineLength
              request: {
                clientUserId: get_client_user_id(context.provider),
                groupName: context.group,
                participantId: context.participant_id,
                reportId: context.report_id
              },
              provider: context.provider
            )
            context.response = response[:body]
            add_hogan_logs(response)
            success_response?(response) ? broadcast(:ok, report) : broadcast(:error, response)
          end

          def report
            context.response['reportFile']
          end

          def add_hogan_logs(response)
            HoganLog.create!(
              log_type: 'GetParticipantReport',
              participant_id: context.participant_id,
              group:  context.group,
              call_stack: caller,
              meta: context.to_h,
              response: response
            )
          end
        end
      end
    end
  end
end

# frozen_string_literal: true

module Services
  module Hogan
    module Api
      module Json
        class ParticipantScore < Base
          def call
            response = get(
              # rubocop:disable Layout/LineLength
              endpoint: "Clients/#{get_client_id(context.provider)}/Groups/#{context.group}/Participants/#{context.participant_id}/Assessments/#{context.assessment_id}/Scores",
              # rubocop:enable Layout/LineLength
              request: {
                clientUserId: get_client_user_id(context.provider),
                groupName: context.group,
                participantId: context.participant_id,
                assessmentId: context.assessment_id,
                normId: context.norm_id
              },
              provider: context.provider
            )
            add_hogan_logs(response)
            success_response?(response) ? broadcast(:ok, response[:body]) : broadcast(:error, response)
          end

          def add_hogan_logs(response)
            HoganLog.create!(
              log_type: 'GetParticipantScore',
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

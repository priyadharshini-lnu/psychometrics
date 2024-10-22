# frozen_string_literal: true

module Services
  module Hogan
    module Api
      module Json
        class AddParticipantAssessment < Base
          def call
            response = post(
              # rubocop:disable Layout/LineLength
              endpoint: "Clients/#{get_client_id(context.provider)}/Groups/#{context.group}/Participants/#{context.participant_id}/Assessments/",
              # rubocop:enable Layout/LineLength
              request: {
                ClientUserId: get_client_user_id(context.provider),
                groupName: context.group,
                participantId: context.participant_id,
                assessments: [
                  {
                    assessmentId: context.assessment_id,
                    formId: context.form_id
                  }
                ]
              },
              provider: context.provider
            )
            success_response?(response) ? broadcast(:ok, response[:body]) : broadcast(:error, response)
          end
        end
      end
    end
  end
end

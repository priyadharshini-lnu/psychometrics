# frozen_string_literal: true

module Services
  module Hogan
    module Api
      module Json
        class AddParticipantReport < Base
          def call
            response = post(
              # rubocop:disable Layout/LineLength
              endpoint: "Clients/#{get_client_id(context.provider)}/Groups/#{context.group}/Participants/#{context.participant_id}/Reports",
              # rubocop:enable Layout/LineLength
              request: {
                ClientUserId: get_client_user_id(context.provider),
                groupName: context.group,
                participantId: context.participant_id,
                reportDetails: [
                  {
                    reportId: context.report_id,
                    assessmentId: context.assessment_id,
                    normId: context.norm_id,
                    languageId: context.language_id,
                    suitabilityid: context.suitability_id
                  }
                ]
              },
              provider: context.provider
            )
            add_hogan_logs(response)
            success_response?(response) ? broadcast(:ok, response[:body]) : broadcast(:error, response)
          end

          def add_hogan_logs(response)
            HoganLog.create!(
              log_type: 'AddParticipantReport',
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

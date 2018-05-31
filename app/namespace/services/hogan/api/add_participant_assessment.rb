module Services
  module Hogan
    module API
      class AddParticipantAssessment < Base
        def call
          context.body = client.call(:add_participant_assessments, message: { inputXML: input_xml }).body
          context.response = response(context.body)
        end

        private

        def input_xml
          %{
          <participant>
            <clientdetails>
              <clientid>#{client_id}</clientid>
              <clientuserid>#{client_user_id}</clientuserid>
              <clientpassword>#{client_password}</clientpassword>
              <groupname>#{context.group}</groupname>
            </clientdetails>
            <participantdetails>
              <participantid>#{context.participant_id}</participantid>
            </participantdetails>
            <assessments>
              <assessmentdetails>
                <assessmentid>#{context.assessment_id}</assessmentid>
                <formid>#{context.form_id}</formid>
              </assessmentdetails>
            </assessments>
          </participant>
        }
        end

        def response(body)
          response_from_xml(body).with_indifferent_access
        end

        def response_from_xml(body)
          Hash.from_xml(body[:add_participant_assessments_response][:add_participant_assessments_result])
        end
      end
    end
  end
end

module Services
  module Hogan
    module API
      class AddParticipantReport < Base
        def call
          context.body = client.call(:add_participant_reports, message: { inputXML: input_xml }).body
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
            <reports>
              <reportdetails>
                <reportid>#{context.report_id}</reportid>
                <assessmentid>#{context.assessment_id}</assessmentid>
                <normid>#{context.norm_id}</normid>
                <languageid>#{context.language_id}</languageid>
              </reportdetails>
            </reports>
          </participant>
        }
        end

        def response(body)
          response_from_xml(body).with_indifferent_access
        end

        def response_from_xml(body)
          Hash.from_xml(body[:add_participant_reports_response][:add_participant_reports_result])
        end
      end
    end
  end
end

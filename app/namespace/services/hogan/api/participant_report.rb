# frozen_string_literal: true

module Services
  module Hogan
    module API
      class ParticipantReport < Base
        def call
          response(client.call(:getparticipantreport, message: { inputXML: input_xml }).body)
          report
        end

        private

        def input_xml
          %(
          <participant>
            <clientdetails>
              <clientid>#{client_id}</clientid>
              <clientuserid>#{client_user_id}</clientuserid>
              <clientpassword>#{client_password}</clientpassword>
              <groupname>#{context.group}</groupname>
            </clientdetails>
            <participantdetails>
              <participantid>#{context.participant_id}</participantid>
              <assessmentid>#{context.assessment_id}</assessmentid>
              <reportid>#{context.report_id}</reportid>
            </participantdetails>
          </participant>

        )
        end

        def response(body)
          context.response ||= response_from_xml(body).with_indifferent_access
        end

        def report
          context.report ||= context.response.dig(:participantdetails, :report)
        end

        def response_from_xml(body)
          response = body.dig(:getparticipantreport_response, :getparticipantreport_result)
          return response if response.class == Hash

          Hash.from_xml(response)
        end
      end
    end
  end
end

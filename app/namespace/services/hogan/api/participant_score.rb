# frozen_string_literal: true

module Services
  module Hogan
    module API
      class ParticipantScore < Base
        around :log_execution

        def call
          context.body = client.call(:get_participant_score, message: { inputXML: input_xml }).body
          context.response = response(context.body)
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
            </participantdetails>
            <assessment>
              <assessmentid>#{context.assessment_id}</assessmentid>
              <normid>#{context.norm_id}</normid>
              <scoretype>RAW</scoretype>
            </assessment>
          </participant>

        )
        end

        def response(body)
          response_from_xml(body).with_indifferent_access
        end

        def response_from_xml(body)
          response = body.dig(:get_participant_score_response, :get_participant_score_result)
          return response if response.class == Hash

          score_from_xml(response)
        end

        def score_from_xml(response)
          ActiveSupport::XmlMini.with_backend('Nokogiri') do
            doc = Nokogiri::XML(response)
            doc.at('//participant/hassignature').remove
            doc.to_hash
          end
        end
      end
    end
  end
end

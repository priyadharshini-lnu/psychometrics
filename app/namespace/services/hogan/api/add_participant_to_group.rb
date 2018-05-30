module Services
  module Hogan
    module API
      class AddParticipantToGroup < Base
        def call
          response(client.call(:add_participants_to_group, message: { inputXML: input_xml }).body)
          participant_id
          log
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
              <password>#{context.password}</password>
              <numberofparticipants>1</numberofparticipants>
              <setgroupoptions>NO</setgroupoptions>
            </participantdetails>
          </participant>

        }
        end

        def response(body)
          context.response ||= response_from_xml(body).with_indifferent_access
        end

        def response_from_xml(body)
          Hash.from_xml(body.dig(:add_participants_to_group_response, :add_participants_to_group_result))
        end

        def participant_id
          context.participant_id ||= context.response.dig(
            :participant, :participants, :participantdetails, :participantid
          )
        end

        def log
          Rails.logger.info(context.participant_id)
        end
      end
    end
  end
end

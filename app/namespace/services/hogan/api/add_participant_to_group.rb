module Services
  module Hogan
    module API
      class AddParticipantToGroup < Base
        around :log_execution

        def call
          context.body = client.call(:add_participants_to_group, message: { inputXML: input_xml }).body
          context.response = response(context.body)
          context.participant_id = participant_id
          log(self, "participantid: #{participant_id.inspect}")

          context.fail! if context.participant_id.nil?
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
          response_from_xml(body).with_indifferent_access
        end

        def response_from_xml(body)
          Hash.from_xml(body.dig(:add_participants_to_group_response, :add_participants_to_group_result))
        end

        def participant_id
          context.response.dig(:participant, :participants, :participantdetails, :participantid)
        end
      end
    end
  end
end

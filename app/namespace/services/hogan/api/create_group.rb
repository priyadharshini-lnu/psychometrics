module Services
  module Hogan
    module API
      class CreateGroup < Base
        def call
          context.body = client.call(:create_group, message: { inputXML: input_xml }).body
          context.response = response(context.body)

          message = response_message(context.response)
          log(self, message)

          unless message[/successfully/i]
            context.fail!(error: message)
          end
        end

        private

        def input_xml
          %{
          <CreateGroup>
            <clientdetails>
              <clientid>#{client_id}</clientid>
              <clientuserid>#{client_user_id}</clientuserid>
              <clientpassword>#{client_password}</clientpassword>
              <groupname>#{context.group}</groupname>
            </clientdetails>
          </CreateGroup>

        }
        end

        def response(body)
          response_from_xml(body).with_indifferent_access
        end

        def response_from_xml(body)
          Hash.from_xml(body[:create_group_response][:create_group_result])
        end

        def response_message(response)
          response.dig(:outputmessage, :message, :text)
        end
      end
    end
  end
end

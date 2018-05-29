module Services
  module Hogan
    module API
      class GroupDetails < Base
        def call
          context.body = client.call(:getgroupdetails, message: { inputXML: input_xml }).body
          context.response = response(context.body)

          return if context.response[:group]

          error = response_message(context.response)
          Rails.logger.debug("Services::Hogan::API::GroupDetails - error: #{error}")
          context.fail!(error: error)
        end

        private

        def input_xml
          %{
          <group>
            <clientdetails>
              <clientid>#{client_id}</clientid>
              <clientuserid>#{client_user_id}</clientuserid>
              <clientpassword>#{client_password}</clientpassword>
              <groupname>#{context.group}</groupname>
            </clientdetails>
          </group>

        }
        end

        def response(body)
          response_from_xml(body).with_indifferent_access
        end

        def response_from_xml(body)
          Hash.from_xml(body[:getgroupdetails_response][:getgroupdetails_result])
        end

        def response_message(response)
          response.dig(:outputmessage, :message, :text)
        end
      end
    end
  end
end

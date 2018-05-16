module Services
  module Hogan
    class GroupDetails < Base

      def call
        response(client.call(:getgroupdetails, message: { inputXML: input_xml }).body)
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
        context.response ||= response_from_xml(body).with_indifferent_access
      end

      def response_from_xml(body)
        Hash.from_xml(body[:getgroupdetails_response][:getgroupdetails_result])
      end
    end
  end
end

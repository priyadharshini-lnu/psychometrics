module Services
  module Hogan
    class CreateGroup < Base

      def call
        context.body = client.call(:create_group, message: { inputXML: input_xml }).body
      end

      def input_xml
        %{
          <CreateGroup>
              <clientid>#{client_id}</clientid>
              <clientuserid>#{client_user_id}</clientuserid>
              <clientpassword>#{client_password}</clientpassword>
              <groupname>#{context.group}</groupname>
          </CreateGroup>

        }
      end
    end
  end
end

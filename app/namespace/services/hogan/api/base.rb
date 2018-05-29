module Services
  module Hogan
    module API
      class Base
        include Interactor

        def client
          @client ||= Savon.client(
            wsdl: Rails.application.secrets.hogan[:wsdl_url], log_level: :debug, logger: Rails.logger
          )
        end

        def client_id
          @client_id ||= Rails.application.secrets.hogan[:client_id]
        end

        def client_user_id
          @client_user_id ||= Rails.application.secrets.hogan[:client_user_id]
        end

        def client_password
          @client_password ||= Rails.application.secrets.hogan[:client_password]
        end
      end
    end
  end
end

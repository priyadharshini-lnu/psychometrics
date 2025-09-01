# frozen_string_literal: true

module Geo
  module Exceptions
    class RestrictedEndpoint < StandardError
      def initialize(message = 'Access restricted from your location')
        super
      end
    end

    class ClientNotFound < StandardError
      def initialize(message = 'Client not found for geo restriction check')
        super
      end
    end
  end
end

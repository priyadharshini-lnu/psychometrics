# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class MicrositeIntegrationSerializer < Panko::Serializer
        attributes :api_key

        def api_key
          key = object.microsite_config['api_key']
          return nil if key.blank?

          "#{'*' * (key.length - 4)}#{key[-4..]}"
        end
      end
    end
  end
end

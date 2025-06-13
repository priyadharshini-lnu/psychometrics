# frozen_string_literal: true

module Administration
  module Projects
    module Integrations
      class HoganIntegrationSerializer < Panko::Serializer
        attributes :provider

        def provider
          object.config['provider']
        end
      end
    end
  end
end

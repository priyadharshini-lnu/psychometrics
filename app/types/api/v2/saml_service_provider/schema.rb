# frozen_string_literal: true

module Api
  module V2
    module SamlServiceProvider
      class Schema < Api::Base::Schema
        def self.resource
          'saml_service_providers'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
            attribute[:entity_id].filled(:string)
            attribute[:acs_urls].filled(:array).each(:string)
            optional(:enabled).maybe(:bool)
            optional(:mask_identity).maybe(:bool)
          end
        end
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    module LicenseUsage
      class Schema < Api::Base::Schema
        def self.resource
          'license_usages'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:extras].filled(:hash) do
              optional(:campaign_name).maybe(:string)
              optional(:subject_name).maybe(:string)
              optional(:subject_email).maybe(:string)
            end
            optional(:status_updated_at).maybe(:string)
            attribute[:status].filled(:string)
          end
        end
      end
    end
  end
end

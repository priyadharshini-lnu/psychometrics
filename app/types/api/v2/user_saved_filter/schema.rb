# frozen_string_literal: true

module Api
  module V2
    module UserSavedFilter
      class Schema < Api::Base::Schema
        def self.resource
          'user_saved_filters'
        end

        def self.attributes(attribute, _type)
          proc do
            attribute[:name].filled(:string)
            attribute[:filter_params].filled(:hash)
            attribute[:resource_type].filled(:string)
            optional(:favorite).filled(:bool)
          end
        end
      end
    end
  end
end

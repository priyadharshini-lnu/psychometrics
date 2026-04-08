# frozen_string_literal: true

module Api
  module V2
    module Dimension::InnovationStyle
      class Schema < Api::Base::Schema
        def self.resource
          'innovation_styles'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:name].filled(:string)
          end
        end

        def self.relationships(_)
          []
        end
      end
    end
  end
end

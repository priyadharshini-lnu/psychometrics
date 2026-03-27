# frozen_string_literal: true

module Api
  module V2
    module Dimension::InnovationStyle::InnovationStylesFactor
      class Schema < Api::Base::Schema
        def self.resource
          'innovation_styles_factors'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:factor_id].filled(:integer)
            attribute[:predicate].filled(:string)
            attribute[:value].filled(:float)
            attribute[:position].maybe(:integer)
            attribute[:weight].maybe(:float)
          end
        end

        def self.relationships(_)
          []
        end
      end
    end
  end
end

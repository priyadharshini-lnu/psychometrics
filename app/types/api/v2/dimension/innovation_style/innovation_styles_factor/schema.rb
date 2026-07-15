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
            attribute[:factor_id].filled(Types::Params::Integer)
            attribute[:predicate].filled(:string)
            attribute[:value].filled(Types::IntOrFloat)
            attribute[:position].maybe(Types::Params::Integer)
            attribute[:weight].maybe(Types::IntOrFloat)
          end
        end

        def self.relationships(_)
          []
        end
      end
    end
  end
end

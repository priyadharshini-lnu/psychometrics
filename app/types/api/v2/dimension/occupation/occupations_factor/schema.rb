# frozen_string_literal: true

module Api
  module V2
    module Dimension::Occupation::OccupationsFactor
      class Schema < Api::Base::Schema
        def self.resource
          'occupations_factors'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:predicate].filled(:string)
            attribute[:value].filled(Types::IntOrFloat)
            optional(:position).maybe(:integer)
            optional(:weight).maybe(Types::IntOrFloat)
          end
        end

        def self.relationships(_)
          []
        end
      end
    end
  end
end

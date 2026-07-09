# frozen_string_literal: true

module Api
  module V2
    module Dimension
      module OccupationConditionSet
        class Schema < Api::Base::Schema
          def self.resource
            'occupation_condition_sets'
          end

          def self.attributes(attribute, _type)
            proc do
              attribute[:name].filled(:string)
            end
          end

          def self.meta?
            false
          end

          def self.links?
            false
          end

          def self.relationships(_)
            []
          end
        end
      end
    end
  end
end

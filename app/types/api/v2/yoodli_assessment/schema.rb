# frozen_string_literal: true

module Api
  module V2
    module YoodliAssessment
      class Schema < Api::Base::Schema
        def self.resource
          'yoodli_assessments'
        end

        def self.attributes(_attribute, _)
          proc do
            required(:name).filled(:string)
            required(:product_id).filled(:string)
            required(:project_id).filled(:integer)
            required(:created_at).filled(:string)
            required(:updated_at).filled(:string)
          end
        end

        def self.create_request
          json_api_attributes do
            required(:name).filled(:string)
            required(:product_id).filled(:string)
          end
        end

        def self.update_request
          json_api_attributes do
            required(:name).filled(:string)
            required(:product_id).filled(:string)
          end
        end
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    module ProjectAssessment
      class Schema < Api::Base::Schema
        def self.resource
          'project_assessments'
        end

        def self.attributes(attribute, _)
          proc do
            attribute[:assessment_id].filled(:integer)
            attribute[:project_id].maybe(:string)
            attribute[:normalize_factor_scores].filled(:bool)
            optional(:created_at).maybe(:string)
            optional(:updated_at).maybe(:string)
          end
        end
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    module AssessmentConsentSetting
      class Schema < Api::Base::Schema
        def self.resource
          'assessment_consent_settings'
        end

        def self.attributes(_attribute, _)
          proc do
            optional(:policy_version).maybe(:integer)
            optional(:data_role).maybe(:string)
            optional(:custom_consent_texts).array(:hash) do
              required(:locale).filled(:string)
              required(:text).maybe(:string)
            end
            optional(:custom_acknowledgment_texts).array(:hash) do
              required(:locale).filled(:string)
              required(:text).maybe(:string)
            end
          end
        end

        def self.relationships(_)
          [
            {
              name: :assessment,
              type: :to_one
            }
          ]
        end
      end
    end
  end
end

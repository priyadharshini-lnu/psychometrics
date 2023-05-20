# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class PearsonForm < BaseForm
        attribute :assessment_id,       Integer
        attribute :norm_id,             String
        attribute :assessment_language, String

        validates :assessment_id, :norm_id, presence: true
        validate :valid_assessment_id, if: -> { assessment_id.present? }

        private

        def valid_assessment_id
          return if assessment_setting

          errors.add(:assessment_id, :invalid)
        end

        def assessment_language
          return unless assessment_setting

          norm_language = assessment_setting.norms['items'].
                          find { |n| n['normId'] == norm_id }&.dig('supportedLanguage')
          return norm_language if norm_language

          assessment_setting.languages['default']
        end

        def assessment_setting
          @assessment_setting ||= PearsonAssessment.find_by(product_id: assessment_id)
        end
      end
    end
  end
end

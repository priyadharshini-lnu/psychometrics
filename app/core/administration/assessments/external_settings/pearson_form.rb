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

          assessment_setting.dig('norms', 'items').find { |n| n['normId'] == norm_id }&.dig('supportedLanguage')
        end

        def assessment_setting
          @assessment_setting ||= Pearson::GetAssessments.call!.find { |a| a['productId'] == assessment_id }
        end
      end
    end
  end
end

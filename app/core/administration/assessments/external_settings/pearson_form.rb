# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class PearsonForm < BaseForm
        attribute :assessment_id,       Integer
        attribute :norm_id,             String
        attribute :assessment_language, String

        validates :assessment_id, :norm_id, presence: true

        private

        def assessment_language
          return unless assessment || norm_id

          pearson_settings = Pearson::GetAssessments.call!.find { |a| a['productId'] == assessment_id }
          pearson_settings.dig('norms', 'items').find { |n| n['normId'] == norm_id }&.dig('supportedLanguage')
        end
      end
    end
  end
end

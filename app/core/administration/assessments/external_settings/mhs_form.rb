# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class MhsForm < BaseForm
        attribute :assessment_id, Integer

        validates :assessment_id, presence: true
        validate :valid_assessment_id, if: -> { assessment_id.present? }

        private

        def valid_assessment_id
          return if assessment_setting

          errors.add(:assessment_id, :invalid)
        end

        def assessment_setting
          @assessment_setting ||= Settings.providers.mhs.assessments.find { |a| a.id.downcase == assessment_id }
        end
      end
    end
  end
end

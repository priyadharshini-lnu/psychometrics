# frozen_string_literal: true

module Administration
  module Assessments
    module ExternalSettings
      class HoganForm < BaseForm
        attribute :assessment_id, Integer
        attribute :form_id,       String

        validates :assessment_id, presence: true
        validate :valid_assessment_id, if: -> { assessment_id.present? }

        private

        def valid_assessment_id
          return if assessment_setting

          errors.add(:assessment_id, :invalid)
        end

        def form_id
          assessment_setting&.form_id
        end

        def assessment_setting
          @assessment_setting ||= Settings.providers.hogan.assessments.find { |a| a.id == assessment_id&.upcase }
        end
      end
    end
  end
end

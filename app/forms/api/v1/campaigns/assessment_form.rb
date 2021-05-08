# frozen_string_literal: true

module Api
  module V1
    module Campaigns
      class AssessmentForm < Rectify::Form
        attribute :id, Integer
        attribute :norm_id, Integer

        validates :id, presence: true

        validate :validate_id
        validate :validate_norm_id

        private

        def validate_id
          return if assessment

          errors.add(:id, 'Invalid assessment id')
        end

        def validate_norm_id
          return unless assessment
          return unless norm_id
          return if assessment.norms.exists?(id: norm_id)

          errors.add(:norm_id, 'Invalid norm id')
        end

        def assessment
          @assessment ||= context.assessments.find { |a| a.id == id }
        end
      end
    end
  end
end

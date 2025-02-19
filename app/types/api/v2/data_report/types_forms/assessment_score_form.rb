# frozen_string_literal: true

module Api::V2::DataReport
  module TypesForms
    class AssessmentScoreForm < BaseForm
      attribute :assessment_id
      attribute :factor_id
      attribute :score_type

      validates :assessment_id, :factor_id, :score_type, presence: true

      validate :assessment_is_owned_by_client
      validate :factor_is_related_to_assessment, if: :valid_assessment?
      validates :score_type, inclusion: { in: %w[norm_score zscore percentage score] }

      def assessment_is_owned_by_client
        return errors.add(:assessment_id, I18n.t('administration.data_reports.errors.not_found')) if assessment.nil?

        if assessment.owner_id.present? && assessment.owner_id != context[:client_id]
          errors.add(:assessment_id, I18n.t('administration.data_reports.errors.not_owned'))
        end
      end

      def factor_is_related_to_assessment
        factor = assessment.dimension.factors.find_by(id: factor_id)
        errors.add(:factor_id, I18n.t('administration.data_reports.errors.factor_not_found')) if factor.nil?
      end

      def valid_assessment?
        assessment.present?
      end

      def assessment
        @assessment ||= ::Assessment.find_by(id: assessment_id)
      end
    end
  end
end

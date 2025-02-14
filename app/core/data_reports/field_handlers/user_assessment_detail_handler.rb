# frozen_string_literal: true

module DataReports::FieldHandlers
  class UserAssessmentDetailHandler < ::DataReports::BaseFieldHandler
    ALLOWED_FIELD_NAMES = %w[status assessment_id created_at completed_at].freeze

    DATE_FIELDS = %w[created_at completed_at].freeze
    DEFAULT_FORMAT = '%d-%b-%Y'

    def call
      return broadcast :ok, nil unless ALLOWED_FIELD_NAMES.include?(field['field_name'])

      broadcast :ok, send(field['field_name'])
    end

    private

    def date_field
      ua = cu.user_assessments.find_by(assessment_id: field['assessment_id'])
      if ua.respond_to?(field['field_name'])
        ua.send(field['field_name'])&.strftime(field['date_format'] || DEFAULT_FORMAT)
      end
    end

    def general_field
      ua = cu.user_assessments.find_by(assessment_id: field['assessment_id'])
      ua.send(field['field_name']) if ua.respond_to?(field['field_name'])
    end

    alias status general_field
    alias assessment_id general_field
    alias created_at date_field
    alias completed_at date_field
  end
end

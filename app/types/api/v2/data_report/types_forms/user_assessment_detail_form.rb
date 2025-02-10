# frozen_string_literal: true

module Api::V2::DataReport
  module TypesForms
    class UserAssessmentDetailForm < BaseForm
      DATE_FIELDS = %w[created_at completed_at].freeze

      attribute :assessment_id
      attribute :field_name
      attribute :date_format

      validates :field_name, presence: true
      validates :date_format, presence: true, if: -> { DATE_FIELDS.include?(field_name) }
    end
  end
end

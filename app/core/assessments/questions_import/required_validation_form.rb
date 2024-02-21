# frozen_string_literal: true

module Assessments
  module QuestionsImport
    class RequiredValidationForm < Rectify::Form
      mimic :questions_import_required_validation_form

      attribute :type, String

      validates :type, inclusion: { in: %w[Force Request] }, allow_nil: true
    end
  end
end

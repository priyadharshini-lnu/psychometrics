# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class StaticContent < Base
        mimic :questions_import_static_content_form

        attribute :type, String

        validates :type, presence: true
        validates :type, inclusion: { in: ['Text'] }, if: -> { type.present? }
      end
    end
  end
end

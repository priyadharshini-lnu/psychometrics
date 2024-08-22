# frozen_string_literal: true

module Mettl
  class EditAssessmentJob < ApplicationJob
    def perform(external_assessment_id)
      mettl_assessment = MettlAssessment.find_by(product_id: external_assessment_id)

      ::Mettl::EditAssessment.call!(mettl_assessment) if mettl_assessment
    end
  end
end

# frozen_string_literal: true

module Mettl
  class SaveAssessments
    def self.call(project, assessments)
      assessments.each do |assessment|
        mettl_assessment = MettlAssessment.find_or_initialize_by(
          project_id: project.id,
          product_id: assessment['id']
        )

        mettl_assessment.update(
          name: assessment['name'],
          duration: assessment['duration'],
          registration_fields: assessment['registrationFields'],
          instructions: assessment['instructions'],
          default_instructions: assessment['defaultInstructions']
        )
      end
    end
  end
end

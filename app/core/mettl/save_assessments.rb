# frozen_string_literal: true

module Mettl
  class SaveAssessments
    def self.call(project, assessments)
      assessments.each do |assessment|
        mettl_assessment = MettlAssessment.find_or_initialize_by(
          project_id: project.id,
          product_id: assessment['id']
        )

        begin
          mettl_assessment.update!(
            name: assessment['name'],
            duration: assessment['duration'],
            registration_fields: assessment['registrationFields'],
            instructions: assessment['instructions'],
            default_instructions: assessment['defaultInstructions']
          )
        rescue ActiveRecord::RecordNotUnique => e
          Sentry.capture_exception(e, extra: { project_id: project.id, product_id: assessment['id'] })
        end
      end
    end
  end
end

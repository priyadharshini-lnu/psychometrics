# frozen_string_literal: true

module Skillvue
  class SaveAssessments
    def self.call(project, assessments)
      assessments.each do |assessment|
        skillvue_assessment = SkillvueAssessment.find_or_initialize_by(
          project_id: project.id,
          product_id: assessment['alias']
        )

        begin
          skillvue_assessment.update!(
            name: assessment['name'],
            expiration: assessment['expiration'],
            iso_code: assessment['iso_code']
          )
        rescue ActiveRecord::RecordNotUnique => e
          Sentry.capture_exception(e, extra: { project_id: project.id, product_id: assessment['alias'] })
        end
      end
    end
  end
end

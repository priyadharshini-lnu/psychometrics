# frozen_string_literal: true

module Microsite
  class SaveAssessments
    def self.call(project, assessments)
      assessments.each do |assessment|
        microsite_assessment = MicrositeAssessment.find_or_initialize_by(
          project_id: project.id,
          product_id: assessment['assessmentId']
        )

        begin
          microsite_assessment.update!(
            name: assessment['name'],
            metadata: { 'questions' => assessment['questions'] }
          )
        rescue ActiveRecord::RecordNotUnique => e
          Sentry.capture_exception(e, extra: { project_id: project.id, product_id: assessment['id'] })
        end
      end
    end
  end
end

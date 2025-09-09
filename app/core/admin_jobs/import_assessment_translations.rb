# frozen_string_literal: true

module AdminJobs
  class ImportAssessmentTranslations < AdminJobs::Base
    def call
      return broadcast :ok, { error_messages: form.errors.full_messages } unless import_form.valid?

      import_form.process!

      if import_form.errors.present?
        broadcast :ok, { error_messages: import_form.errors.full_messages }
      else
        broadcast :ok
      end
    end

    def generate_title_link
      {
        href: "/administration/assessments/#{assessment.id}",
        label: assessment.name
      }
    end

    def import_form
      @import_form ||= ::Imports::Translations::AssessmentImport.new(resource_id: assessment.id, file: record.file)
    end

    def valid?
      assessment.present?
    end

    private

    def assessment
      @assessment ||= Assessment.find_by(id: record.data['assessment_id'])
    end
  end
end

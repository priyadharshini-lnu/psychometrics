# frozen_string_literal: true

module AdminJobs
  class MigrateAssessmentTranslations < AdminJobs::Base
    include Rails.application.routes.url_helpers

    def call
      Builders::Translations::AssessmentTranslationMigrator.new(assessment).call

      broadcast :ok
    end

    def generate_title_link
      {
        href: administration_assessment_path(id: assessment.id),
        label: assessment.name
      }
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

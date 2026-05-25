# frozen_string_literal: true

module Microsite
  class SaveAssessments < BaseCommand
    private_attr_reader :project, :assessments

    def initialize(project, assessments)
      @project = project
      @assessments = assessments
    end

    def call
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

          sync_question_mappings(microsite_assessment)
        rescue ActiveRecord::RecordNotUnique => e
          Sentry.capture_exception(e, extra: { project_id: project.id, product_id: assessment['id'] })
        end
      end

      broadcast :ok
    end

    private

    def sync_question_mappings(microsite_assessment)
      catalog_keys = microsite_assessment.metadata&.dig('questions')&.keys || []
      return if catalog_keys.empty?

      linked_assessments(microsite_assessment).find_each do |assessment|
        existing_mappings = assessment.external_settings&.dig('question_mappings') || {}
        new_keys = catalog_keys - existing_mappings.keys

        next if new_keys.empty?

        new_keys.each { |key| existing_mappings[key] = nil }
        assessment.update!(
          external_settings: assessment.external_settings.merge('question_mappings' => existing_mappings)
        )
      end
    end

    def linked_assessments(microsite_assessment)
      Assessment.microsite.where(
        'external_settings @> ?',
        { assessment_id: microsite_assessment.product_id }.to_json
      )
    end
  end
end

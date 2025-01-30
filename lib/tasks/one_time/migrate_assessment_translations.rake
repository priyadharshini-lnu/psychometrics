# frozen_string_literal: true

namespace :one_time do
  task :migrate_assessment_translations, %i[update_translations_migrated assessment_id] => %i[environment] do |_, args|
    update_translations_migrated = args[:update_translations_migrated] == 'true'
    updated_assessments = []

    assessments = if args[:assessment_id].present?
                    [Assessment.find(args[:assessment_id])]
                  else
                    Assessment.where(translations_migrated: false)
                  end

    assessments.each do |assessment|
      next if assessment.translations_migrated

      Builders::Translations::AssessmentTranslationMigrator.new(assessment).call

      if update_translations_migrated
        assessment.update!(translations_migrated: true)
      end

      updated_assessments << assessment.id
    end

    puts "Updated Assessments: #{updated_assessments.join(', ')}"
  end
end

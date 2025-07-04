# frozen_string_literal: true

module AdminJobs
  class ImportProficiencyLevelTranslationsJob < AdminJobs::Base
    def call
      project_id = record.data&.dig('project_id')
      result = Administration::ImportProficiencyLevelTranslations.new(
        record.file,
        project_id
      ).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{result.join(', ')}"
      end
    end

    def generate_title_link
      {
        href: "/admin/projects/#{project&.id}/proficiency_levels/import_translations",
        label: "#{project&.name || 'Unknown'} Project"
      }
    end

    private

    def project
      @project ||= Project.find_by(id: record.data&.dig('project_id'))
    end
  end
end

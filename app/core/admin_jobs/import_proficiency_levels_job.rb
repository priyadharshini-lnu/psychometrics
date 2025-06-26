# frozen_string_literal: true

module AdminJobs
  class ImportProficiencyLevelsJob < AdminJobs::Base
    def call
      result = Administration::ImportProficiencyLevels.new(
        record.file,
        project_id: record.data['project_id'],
        ignore_duplicates: record.data['ignore_duplicates']
      ).call

      if result == true
        broadcast :ok
      else
        raise StandardError, "Import failed: #{result.join(', ')}"
      end
    end

    # def generate_title_link
    #   {
    #     href: "/admin/projects/#{project&.id}/proficiency_levels/import",
    #     label: "#{project.name} Project"
    #   }
    # end

    private

    def project
      @project ||= Project.find_by(id: record.data['project_id'])
    end
  end
end

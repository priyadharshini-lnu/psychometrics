# frozen_string_literal: true

module AdminJobs
  module SkillsRater
    class ImportTaxonomies < AdminJobs::Base
      def call
        ::SkillsRaterAssessments::ImportTaxonomies.call!(file_path: record.file.url, project: project)
        broadcast :ok
      end

      def generate_title_link
        {
          href: "/admin/projects/#{project.id}/taxonomy/mappings",
          label: project.name
        }
      end

      def valid?
        project.present?
      end
    end
  end
end

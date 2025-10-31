# frozen_string_literal: true

module AdminJobs
  module SkillRater
    class ImportTaxonomies < AdminJobs::Base
      step :import, AdminJobSteps::ImportTaxonomies::ImportJob, weight: 0.5
      step :generate_embeddings, AdminJobSteps::ImportSkills::GenerateEmbeddingsJob, weight: 0.5

      def generate_title_link
        if project.nil?
          return {
            href: '/admin/skills_taxonomy/skills',
            label: I18n.t('administration.taxonomy.title')
          }
        end

        {
          href: "/admin/projects/#{project.id}/taxonomy/skills",
          label: project.name
        }
      end

      def valid?
        record.file.present?
      end

      def generate_details
        [['Imported file', file_href]]
      end

      private

      def file_href
        if record.file.present?
          content_tag(:a, record.file.filename, href: record.file.url, target: '_blank',
            rel: 'noopener')
        end
      end
    end
  end
end

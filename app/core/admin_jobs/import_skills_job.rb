# frozen_string_literal: true

module AdminJobs
  class ImportSkillsJob < AdminJobs::Base
    step :import, AdminJobSteps::ImportSkills::ImportJob, weight: 0.5
    step :generate_embeddings, AdminJobSteps::ImportSkills::GenerateEmbeddingsJob, weight: 0.5

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

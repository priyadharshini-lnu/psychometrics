# frozen_string_literal: true

module AdminJobs
  class GenerateEmbeddingSkillsJob < AdminJobs::Base
    def generate_details
      [['Generate Embeddings', 'Generating embeddings for all skills in the system']]
    end

    def call
      skills_to_process = Skill.all
      embedding_result_service = Skills::GenerateEmbedding.new(skills_to_process, job_record)
      embedding_result_service.on(:ok) do
        job_record.complete!
      end.on(:error) do |error_message|
        job_record.fail!(["Embedding generation failed: #{error_message}"])
      end.call

      broadcast :ok
    end
  end
end

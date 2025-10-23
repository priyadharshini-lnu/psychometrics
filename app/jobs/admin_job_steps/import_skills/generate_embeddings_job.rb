# frozen_string_literal: true

module AdminJobSteps
  module ImportSkills
    class GenerateEmbeddingsJob < AdminJobSteps::BaseSubjob
      queue_as :low_priority
      track_job_run

      def perform(job_record)
        job_record.update!(status: :in_progress)

        imported_skill_ids = job_record.parent_job.data['imported_skill_ids']

        skills_to_process = Skill.where(id: imported_skill_ids)

        embedding_result_service = Skills::GenerateEmbedding.new(skills_to_process, job_record)

        embedding_result_service.on(:ok) do
          job_record.complete!
        end.on(:error) do |error_message|
          job_record.fail!(["Embedding generation failed: #{error_message}"])
        end.
          call
      rescue StandardError => e
        job_record.fail!(['Embedding generation failed'], e)
      ensure
        job_record.parent_job.update!(status: :completed)
      end
    end
  end
end

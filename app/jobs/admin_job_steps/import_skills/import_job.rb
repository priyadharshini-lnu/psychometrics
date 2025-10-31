# frozen_string_literal: true

module AdminJobSteps
  module ImportSkills
    class ImportJob < AdminJobSteps::BaseSubjob
      queue_as :low_priority
      track_job_run

      def perform(job_record)
        job_record.update!(status: :in_progress)

        import_skill_service = Administration::ImportSkills.new(
          job_record.parent_job.file,
          job_record.data['project_id']
        )

        import_skill_service.on(:ok) do |imported_skill_ids|
          job_record.parent_job.update!(data: { 'imported_skill_ids' => imported_skill_ids })
          job_record.increment_completed_tasks!
        end.on(:error) do |error_message|
          job_record.fail!(["Import failed: #{error_message}"])
        end.
          call
      rescue StandardError => e
        job_record.fail!([e.message], e)
      end
    end
  end
end

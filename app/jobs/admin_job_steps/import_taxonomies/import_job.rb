# frozen_string_literal: true

module AdminJobSteps
  module ImportTaxonomies
    class ImportJob < AdminJobSteps::BaseSubjob
      queue_as :low_priority
      track_job_run

      def perform(job_record)
        job_record.update!(status: :in_progress)

        import_taxonomies_service = SkillRaterAssessments::ImportTaxonomies.new(
          file_path: job_record.parent_job.file.url,
          project: project_from_data(job_record)
        )

        import_taxonomies_service.on(:ok) do |imported_skill_ids|
          job_record.parent_job.update!(data: { 'imported_skill_ids' => imported_skill_ids })
          job_record.increment_completed_tasks!
        end.on(:error) do |error_message|
          job_record.fail!(["Import failed: #{error_message}"])
        end.
          call
      rescue StandardError => e
        job_record.fail!([e.message], e)
      end

      private

      def project_from_data(job_record)
        project_id = job_record.data['project_id']
        return nil if project_id.nil?

        Project.find(project_id)
      end
    end
  end
end

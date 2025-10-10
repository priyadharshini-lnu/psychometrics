# frozen_string_literal: true

module AdminJobSteps
  module BulkDownloadIdpReports
    class GenerateJob < AdminJobSteps::BaseSubjob
      queue_as :low_priority
      track_job_run

      def perform(job_record)
        user_idp_plans = UserIdpPlan.active.where(campaign_id: job_record.data['campaign_id'])
        raise I18n.t('admin_jobs.bulk_download_reports.errors.no_plans') if user_idp_plans.empty?

        job_record.update!(status: :in_progress, total_tasks: user_idp_plans.length)
        ::Idp::BulkGenerate.call(user_idp_plans: user_idp_plans, current_user: job_record.owner,
                                 job_record: job_record)
      rescue StandardError => e
        job_record.fail!([e.message], e)
      end
    end
  end
end

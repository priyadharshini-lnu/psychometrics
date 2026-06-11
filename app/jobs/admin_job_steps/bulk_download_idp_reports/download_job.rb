# frozen_string_literal: true

module AdminJobSteps
  module BulkDownloadIdpReports
    class DownloadJob < AdminJobSteps::BaseSubjob
      include ActionView::Helpers::TagHelper
      include ActionView::Context

      queue_as :low_priority
      track_job_run

      def perform(job_record)
        user_ids = Campaign.find(job_record.data['campaign_id']).user_ids
        user_idp_plans = UserIdpPlan.active.where(campaign_id: job_record.data['campaign_id'], user_id: user_ids)

        raise I18n.t('admin_jobs.bulk_download_reports.errors.no_plans') if user_idp_plans.empty?

        job_record.update!(status: :in_progress, total_tasks: user_idp_plans.length)
        @bulk_report = ::Idp::BulkDownload.call!(user_idp_plans: user_idp_plans,
                                                 current_user: job_record.owner,
                                                 job_record: job_record)
        job_record.update!(data: job_record.data.merge({ bulk_report_id: @bulk_report.id }))

        job_record.parent_job.update(content: content, status: :completed)
      rescue StandardError => e
        job_record.fail!([e.message], e)
      end

      def content
        download_urls = @bulk_report.public_download_urls

        [
          content_tag(:div, I18n.t('admin_jobs.bulk_download_reports.content.title')),
          content_tag(:ul) do
            @bulk_report.files.map.with_index do |file, index|
              content_tag(:li) do
                content_tag(:a, file.filename.to_s, href: download_urls[index])
              end
            end.join.html_safe
          end
        ].join.html_safe
      end
    end
  end
end

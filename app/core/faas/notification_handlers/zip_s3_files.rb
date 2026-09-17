# frozen_string_literal: true

module Faas
  module NotificationHandlers
    class ZipS3Files < Base
      include ActionView::Helpers::TagHelper
      include ActionView::Context
      include Rails.application.routes.url_helpers

      def call
        bulk_report = BulkReport.find_by(id: data['bulk_report_id'])
        return broadcast :ok unless bulk_report

        admin_job = AdminJobRecord.find_by(id: data['admin_job_record_id'])
        if admin_job && data['status'] == 'failed'
          admin_job.update!(status: :failed, error_messages: [data['error']])
          return broadcast :ok
        end

        update_job_progress(admin_job)
        return broadcast :ok unless data['status'] == 'completed'

        attach_zip_to(bulk_report)

        if admin_job
          complete_admin_job(admin_job, bulk_report)
        else
          BulkReportMailer.notify(bulk_report).deliver_later
        end

        broadcast :ok
      end

      private

      def update_job_progress(admin_job)
        return unless admin_job && data['completed_tasks']
        return if project_bulk_report_job?(admin_job)

        admin_job.update!(completed_tasks: data['completed_tasks'])
      end

      def attach_zip_to(bulk_report)
        blob = ActiveStorage::Blob.create_before_direct_upload!(
          key: bulk_report.attachment_storage_path('files', "#{data['file_name']}.zip"),
          filename: "#{data['file_name']}.zip",
          byte_size: data['file_size'],
          checksum: data['checksum'],
          content_type: 'application/zip',
          service_name: Settings.storage.private_storage_service
        )

        ActiveStorage::Attachment.create!(record: bulk_report, blob: blob, name: 'files')
      end

      def complete_admin_job(admin_job, bulk_report)
        if project_bulk_report_job?(admin_job)
          complete_project_bulk_report_job(admin_job, bulk_report)
        else
          complete_bulk_report_job(admin_job, bulk_report)
        end
      end

      def complete_project_bulk_report_job(admin_job, bulk_report)
        admin_job.increment_completed_tasks!
        return unless admin_job.total_tasks == admin_job.completed_tasks

        BulkReportMailer.notify(bulk_report).deliver_later

        bulk_report_job = BulkReportJob.find(admin_job.data['bulk_report_job_id'])
        content = content_tag(
          :a,
          I18n.t('admin.bulk_reports_view_downloads'),
          href: bulk_report_job.project_bulk_report_job_url
        )
        admin_job.update!(content: content)
        admin_job.complete!
      end

      def complete_bulk_report_job(admin_job, bulk_report)
        BulkReportMailer.notify(bulk_report).deliver_later
        bulk_report.files.reload
        url = bulk_report.public_download_urls.first
        content = content_tag(:a, data['file_name'], href: url)
        admin_job.update!(content: content)
        admin_job.complete!
      end

      def project_bulk_report_job?(admin_job)
        admin_job.project_bulk_download_reports?
      end
    end
  end
end

# frozen_string_literal: true

module Api
  class V2::Administration::Projects::BulkReportJobsController < Api::V2::Administration::BaseController
    before_action :bulk_report_job, only: :download_file

    def bulk_download
      payload = project_bulk_download_payload

      admin_job = AdminJob.call(
        :project_bulk_download_reports,
        payload,
        current_user
      )

      audit!(
        :project_bulk_download_reports,
        nil,
        user: current_user,
        record_type: 'BulkReportJob',
        project:     project,
        payload:     payload
      )

      render json: {
        data: {
          id: admin_job.id.to_s,
          type: 'bulk_report_jobs',
          attributes: { status: 'queued' }
        }
      }, status: :created
    end

    def download_file
      return head :not_found unless bulk_report_file_url

      audit!(
        :project_bulk_report_file_download,
        bulk_report_job,
        user: current_user,
        project: project,
        payload: {
          bulk_report_job_id: bulk_report_job.id,
          file_id: params[:file_id],
          filename: params[:filename]
        }
      )

      redirect_to bulk_report_file_url
    end

    private

    def policy_class
      Api::Administration::ProjectBulkReportPolicy
    end

    def bulk_report_job
      @bulk_report_job ||= BulkReportJob.find_by!(
        id:            params[:id],
        project_id:    project.id,
        created_by_id: current_user.id
      )
    end

    def bulk_report_file_url
      params[:url]
    end

    def project_bulk_download_payload
      attrs = params.dig(:data, :attributes) || params
      attrs.permit(
        :start_date,
        :end_date,
        :include_inactive_users,
        campaign_ids:     [],
        selected_reports: {}
      ).to_h.merge('project_id' => project.id)
    end
  end
end

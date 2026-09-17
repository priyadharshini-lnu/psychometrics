# frozen_string_literal: true

class Api::V2::Administration::Projects::BulkReportJobResource < Api::V2::Administration::BaseResource
  include Rails.application.routes.url_helpers

  attributes :status, :created_at, :start_date, :end_date, :files_count, :created_by,
             :files, :error_messages, :campaigns, :selected_reports, :include_inactive_users

  ransack_filters %i[id_eq]

  def status
    admin_job_record&.status || 'pending'
  end

  def files_count
    bulk_report&.files_attachments&.size || 0
  end

  def error_messages
    Array(admin_job_record&.error_messages)
  end

  def campaigns
    ids = Array(admin_job_record&.data&.dig('campaign_ids')).uniq
    return [] if ids.empty?

    Campaign.where(id: ids).pluck(:id, :name).map { |id, name| { id: id, name: name } }
  end

  def include_inactive_users
    admin_job_record&.data&.dig('include_inactive_users') == true
  end

  def selected_reports
    raw = admin_job_record&.data&.dig('selected_reports') || {}
    return {} if raw.empty?

    report_ids = raw.keys.map(&:to_i)
    names = Report.where(id: report_ids).pluck(:id, :name).to_h

    raw.each_with_object({}) do |(report_id, locales), result|
      result[report_id] = {
        name: names[report_id.to_i] || "Report ##{report_id}",
        locales: locales
      }
    end
  end

  def files
    return [] unless bulk_report_with_files

    bulk_report_with_files.files.map do |file|
      {
        id: file.id,
        filename: file.filename.to_s,
        url: download_file_api_v2_administration_project_bulk_report_job_path(
          @model.project_id,
          @model.id,
          url: file.url,
          file_id: file.id
        )
      }
    end
  end

  def created_by
    @model.created_by&.decorate&.display_name
  end

  def self.records(options = {})
    project_id = options.dig(:context, :params, :project_id)
    current_user = options.dig(:context, :user)

    BulkReportJob.
      where(project_id: project_id).
      where(created_by_id: current_user.id).
      includes(:created_by, :admin_job_record).
      preload(bulk_report: :files_attachments)
  end

  private

  def admin_job_record
    @admin_job_record ||= @model.admin_job_record
  end

  def bulk_report
    @bulk_report ||= @model.bulk_report
  end

  def bulk_report_with_files
    @bulk_report_with_files ||= ActsAsTenant.without_tenant do
      BulkReport.includes(files_attachments: :blob).find_by(id: @model.bulk_report_id)
    end
  end
end

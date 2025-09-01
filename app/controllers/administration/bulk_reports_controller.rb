# frozen_string_literal: true

module Administration
  class BulkReportsController < Administration::BaseController
    skip_before_action :enforce_geo_restriction
    before_action :skip_authorization
    before_action :set_bulk_report
    before_action :check_geo_access

    def download
      index = params[:index].to_i
      report_blob = @bulk_report.files[index]&.blob

      if report_blob&.service&.exist?(report_blob.key)
        redirect_to @bulk_report.private_download_url(index)
      else
        redirect_to(admin_path, error: t('.removed'))
      end
    end

    private

    def set_bulk_report
      @bulk_report = current_user.bulk_reports.find(params[:id])
    end

    def check_geo_access
      campaign = @bulk_report.campaign
      return if campaign.blank?

      campaign.client.check_geo_restriction!
    end
  end
end

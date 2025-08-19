# frozen_string_literal: true

module Administration
  class BulkReportsController < Administration::BaseController
    before_action :skip_authorization

    def download
      resource = current_user.bulk_reports.find(params[:id])
      index = params[:index].to_i || 0

      report_blob = resource.files[index]&.blob

      if report_blob&.service&.exist?(report_blob.key)
        redirect_to resource.private_download_url(index)
      else
        redirect_to(admin_path, error: t('.removed'))
      end
    end
  end
end

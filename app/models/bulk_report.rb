# frozen_string_literal: true

class BulkReport < ApplicationRecord
  belongs_to :user

  mount_uploader :file, BulkReportUploader

  def input_dir
    Rails.root.join('tmp', 'bulk_reports', id.to_s).to_s
  end

  def output_file
    "bulk_reports_#{Date.today.strftime('%F')}.zip"
  end

  def expiration_date
    created_at + 6.days
  end

  def public_download_url
    Rails.application.routes.url_helpers.download_administration_bulk_report_url(id, host: Settings.domain, port: Settings.port)
  end

  def private_download_url
    uri = URI(file.url)
    unless uri.host
      uri.host = Settings.domain
      uri.port = Settings.port
    end
    uri.scheme = 'http'
    uri.to_s
  end
end

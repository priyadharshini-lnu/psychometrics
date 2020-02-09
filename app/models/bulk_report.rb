# frozen_string_literal: true

class BulkReport < ApplicationRecord
  include Rails.application.routes.url_helpers

  belongs_to :user

  mount_uploaders :files, BulkReportUploader

  def input_dir
    Rails.root.join('tmp', 'bulk_reports', id.to_s).to_s
  end

  def output_dir
    Rails.root.join('tmp', 'bulk_reports', "compressed_#{id}").to_s
  end

  def expiration_date
    created_at + 6.days
  end

  def public_download_urls
    return [download_administration_bulk_report_url(default_options)] if files.length <= 1

    files.each_with_index.map { |_, i| download_administration_bulk_report_url(default_options.merge(index: i)) }
  end

  def private_download_url(index)
    uri = URI(files[index].url)
    unless uri.host
      uri.host = Settings.domain
      uri.port = Settings.port
    end
    uri.scheme = Settings.protocol
    uri.to_s
  end

  private

  def default_options
    { id: self, host: Settings.domain, port: Settings.port }
  end
end

# frozen_string_literal: true

class BulkReport < ApplicationRecord
  include Rails.application.routes.url_helpers
  include ActiveStorageAttachable
  # temporary include syncable library to keep sync between CarrierWave and ActiveStorage
  # TODO: remove after migration to ActiveStorage
  include ActiveStorageSync

  belongs_to :user

  mount_uploaders :files, Private::BulkReportUploader

  has_many_attachments :as_files, service: Settings.storage.private_storage_service, content_type: %w[zip]
  # TODO: remove after migration to ActStor
  # list of CarrierWave attributes to be synced to ActiveStorage
  sync_to_active_storage :files

  def attachment_storage_path(attribute_name, filename)
    "private/bulk_report/#{id}/#{attribute_name}/#{filename}"
  end

  # TODO: remove after ActiveStorage implementation?
  def store_dir
    "uploads/#{self.class.to_s.underscore}/files/#{id}"
  end

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

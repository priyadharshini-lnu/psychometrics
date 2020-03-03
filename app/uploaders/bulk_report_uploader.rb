# frozen_string_literal: true

class BulkReportUploader < CarrierWave::Uploader::Base
  # configure do |config|
  #   config.remove_previously_stored_files_after_update = false
  # end

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Add a white list of extensions which are allowed to be uploaded.
  def extension_whitelist
    %w[zip]
  end
end

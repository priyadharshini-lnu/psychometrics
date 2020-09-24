# frozen_string_literal: true

class PdfUploader < CarrierWave::Uploader::Base
  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    return model.pdf_path if model.is_a?(UserReport) && model.pdf_path.present?

    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w[pdf]
  end

  def fog_public
    false
  end

  def fog_authenticated_url_expiration
    10.minutes
  end
end

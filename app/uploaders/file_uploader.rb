# frozen_string_literal: true

class FileUploader < CarrierWave::Uploader::Base
  # Include RMagick or MiniMagick support:
  include CarrierWave::MiniMagick

  # Choose what kind of storage to use for this uploader:
  # storage :file
  # storage :fog

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Create different versions of your uploaded files:
  version :thumb, if: :image? do
    process resize_to_fit: [50, 50]
  end

  def url(version = nil)
    is_svg? ? super() : super(version)
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w[jpg jpeg gif png mp3 mp4 wma avi pdf svg]
  end

  protected

  def image?(new_file)
    new_file.extension.downcase.in?(%w[jpg jpeg gif png])
  end

  def is_svg?
    file && file.extension == 'svg'
  end
end

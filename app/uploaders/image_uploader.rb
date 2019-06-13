class ImageUploader < CarrierWave::Uploader::Base
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
  version :thumb, if: :is_raster? do
    process resize_to_fill: [50, 50]
  end

  version :small, if: :is_raster? do
    process resize_to_fill: [150, 150]
  end

  version :middle, if: :is_raster? do
    process resize_to_fill: [350, 350]
  end

  version :factors_icon, if: :is_raster? do
    process resize_to_fit: [50, 50]
  end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  def extension_whitelist
    %w(jpg jpeg gif png bmp svg)
  end

  def filename
    "#{secure_token}.#{file.extension}" if original_filename.present?
  end

  def url(version = nil)
    is_svg? ? super() : super(version)
  end

  protected

  def secure_token
    var = :"@#{mounted_as}_secure_token"
    model.instance_variable_get(var) or model.instance_variable_set(var, SecureRandom.uuid)
  end

  def is_svg?
    file && file.extension == 'svg'
  end

  def is_raster?(new_file)
    new_file.extension != 'svg'
  end

end

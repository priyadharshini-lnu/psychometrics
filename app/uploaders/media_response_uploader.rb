class MediaResponseUploader < CarrierWave::Uploader::Base
  if Rails.env.production?
    include CarrierWaveDirect::Uploader
  end

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}"
  end

  def extension_whitelist
    %w(mp4)
  end
end

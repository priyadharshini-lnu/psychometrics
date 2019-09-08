# frozen_string_literal: true

class MediaResponseUploader < CarrierWave::Uploader::Base
  include CarrierWaveDirect::Uploader if Rails.env.production?

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}"
  end

  def extension_whitelist
    %w[mp4]
  end
end

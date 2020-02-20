# frozen_string_literal: true

require 'carrierwave/storage/fog'
require 'carrierwave_direct'

class MediaResponseUploader < CarrierWave::Uploader::Base
  include CarrierWaveDirect::Uploader if Rails.env.production?

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}"
  end

  def extension_whitelist
    question.props['allowedFileTypes'] || %w[mp4]
  end

  def max_file_size
    question.props['maxFileSize']&.megabytes&.to_i || 200.megabytes
  end

  def question
    model.question
  end
end

# frozen_string_literal: true

require 'carrierwave/storage/fog'
require 'carrierwave_direct'

class MediaResponseUploader < CarrierWave::Uploader::Base
  include CarrierWaveDirect::Uploader

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}"
  end

  def extension_whitelist
    return question.props['allowedFileTypes'] if question.props['allowedFileTypes']

    return %w[mp4] if question.type == 'VideoResponse'

    return %w[wav] if question.type == 'AudioResponse'
  end

  def max_file_size
    question.props['maxFileSize']&.megabytes&.to_i || 200.megabytes
  end

  def question
    model.question
  end
end

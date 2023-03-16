# frozen_string_literal: true

require 'carrierwave/storage/fog'
require 'carrierwave_direct'

module Private
  class MediaResponseUploader < CarrierWave::Uploader::Base
    include CarrierWaveDirect::Uploader
    include PrivatableUploader

    delegate :question, to: :model

    def store_dir
      "uploads/#{model.class.to_s.underscore}/#{mounted_as}"
    end

    def extension_whitelist
      return allowed_file_types_from_question if question.props['allowedFileTypes']

      return %w[mp4 webm] if question.type == 'VideoResponse'

      return %w[wav] if question.type == 'AudioResponse'
    end

    def max_file_size
      question.props['maxFileSize']&.megabytes&.to_i || 200.megabytes
    end

    def fog_authenticated_url_expiration
      1.week
    end

    private

    def allowed_file_types_from_question
      return question.props['allowedFileTypes'].concat(['jpeg']) if question.props['allowedFileTypes'].include?('jpg')

      question.props['allowedFileTypes']
    end
  end
end

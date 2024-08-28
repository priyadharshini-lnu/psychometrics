# frozen_string_literal: true

require 'carrierwave/storage/fog'
require 'carrierwave_direct'

module Private
  class ImageDirectUploader < CarrierWave::Uploader::Base
    include CarrierWaveDirect::Uploader
    include PrivatableUploader

    def store_dir
      "uploads/#{model.class.to_s.underscore}/#{mounted_as}"
    end
  end
end

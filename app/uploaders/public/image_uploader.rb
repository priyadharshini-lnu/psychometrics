# frozen_string_literal: true

module Public
  class ImageUploader < CarrierWave::Uploader::Base
    include CarrierWave::MiniMagick

    def store_dir
      "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    end

    version :thumb, if: :raster? do
      process resize_to_fill: [50, 50]
    end

    version :small, if: :raster? do
      process resize_to_fill: [150, 150]
    end

    version :middle, if: :raster? do
      process resize_to_fill: [350, 350]
    end

    version :factors_icon, if: :raster? do
      process resize_to_fit: [50, 50]
    end

    def extension_whitelist
      %w[jpg jpeg gif png bmp svg]
    end

    def raster_extensions
      %w[jpg jpeg png bmp]
    end

    def filename
      "#{secure_token}.#{file.extension}" if original_filename.present?
    end

    def url(*args)
      version_absent = !args.first.respond_to?(:to_sym)
      return super if version_absent || file.nil? || raster?(file)

      super(*args[1..])
    end

    protected

    def secure_token
      var = :"@#{mounted_as}_secure_token"
      model.instance_variable_get(var) || model.instance_variable_set(var, SecureRandom.uuid)
    end

    def svg?
      file && file.extension == 'svg'
    end

    def raster?(new_file)
      raster_extensions.include?(new_file.extension)
    end
  end
end

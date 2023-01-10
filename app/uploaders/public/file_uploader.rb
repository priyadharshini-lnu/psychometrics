# frozen_string_literal: true

module Public
  class FileUploader < CarrierWave::Uploader::Base
    include CarrierWave::MiniMagick

    def store_dir
      "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
    end

    version :thumb, if: :image? do
      process resize_to_fit: [50, 50]
    end

    def url(version = nil)
      return super() if svg? || version.nil?

      super(version)
    end

    def extension_whitelist
      %w[jpg jpeg gif png mp3 mp4 wma avi pdf svg csv xlsx xls]
    end

    def real_filename
      model.read_attribute(:file)
    end

    protected

    def image?(new_file)
      new_file.extension.downcase.in?(%w[jpg jpeg gif png])
    end

    def svg?
      file && file.extension == 'svg'
    end
  end
end

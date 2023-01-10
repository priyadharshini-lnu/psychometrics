# frozen_string_literal: true

module Public
  class BackgroundUploader < ImageUploader
    def extension_whitelist
      %w[jpg jpeg gif png svg mp4]
    end

    def image?
      video? == false
    end

    def video?
      file && file.extension == 'mp4'
    end
  end
end

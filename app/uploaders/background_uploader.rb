# frozen_string_literal: true

class BackgroundUploader < ImageUploader
  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
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

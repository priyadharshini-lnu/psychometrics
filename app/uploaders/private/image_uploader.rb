# frozen_string_literal: true

module Private
  class ImageUploader < Public::ImageUploader
    include PrivatableUploader
  end
end

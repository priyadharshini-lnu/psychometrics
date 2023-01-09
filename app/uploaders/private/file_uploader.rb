# frozen_string_literal: true

module Private
  class FileUploader < Public::FileUploader
    include PrivatableUploader
  end
end

# frozen_string_literal: true

module ActiveStorageHelper
  def active_storage_file_path(file)
    ActiveStorage::Blob.service.path_for(file.key)
  end
end

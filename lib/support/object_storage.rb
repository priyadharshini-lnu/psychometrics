# frozen_string_literal: true

module Support
  class ObjectStorage
    STORAGE_PATH = 'tmp/support'
    DEFAULT_EXPIRY = 15.minutes

    def initialize(file_name, io, content_type:, expires_in: DEFAULT_EXPIRY)
      @key = "#{STORAGE_PATH}/#{file_name}"
      @io = io
      @content_type = content_type
      @expires_in = expires_in
    end

    def upload
      storage_service.upload(key, io, content_type: content_type)
      presigned_url
    end

    private

    attr_reader :key, :io, :content_type, :expires_in

    def presigned_url
      storage_service.url(
        key,
        expires_in: expires_in,
        filename: ActiveStorage::Filename.new(File.basename(key)),
        disposition: :attachment,
        content_type: content_type
      )
    end

    def storage_service
      @storage_service ||= ActiveStorage::Blob.services.fetch(Settings.storage.private_storage_service)
    end
  end
end

# frozen_string_literal: true

class CleanupStaleTemporaryUploadsJob < ApplicationJob
  queue_as :default

  def perform
    client = Aws::S3::Client.new
    TemporaryUpload.stale.find_each do |upload|
      begin
        client.delete_object(
          bucket: upload.bucket,
          key: upload.file_key
        )
      rescue Aws::Errors::ServiceError => e
        Rails.logger.warn("CleanupStaleTemporaryUploadsJob: Failed to delete object #{upload.file_key}
          from #{upload.bucket}: #{e.message}")
        # We catch the error but still destroy the record if the object is missing or 403,
        # so it doesn't get stuck forever. Some AWS errors might require keeping it,
        # but for stale uploads it's safer to discard.
      end

      upload.destroy
    end
  end
end

# frozen_string_literal: true

module ObjectStorage
  class RemoveFileJob < ApplicationJob
    queue_as :low_priority

    def perform(key, bucket)
      Settings.secrets.s3_compatible_storage
      Aws::S3::Client.new.delete_object(key: key, bucket: bucket)
    end
  end
end

# frozen_string_literal: true

module UsersResults
  class CopyMediaResponseJob < ApplicationJob
    def perform(media_response, to_user_result)
      filename = "#{SecureRandom.uuid}/#{media_response.filename}"

      begin
        bucket = Rails.application.secrets.s3_compatible_storage[:private_bucket]
        Aws::S3::Client.new.copy_object(
          bucket: bucket,
          copy_source: "#{bucket}/#{media_response.asset.path}",
          key: "uploads/media_response/asset/#{filename}",
          acl: media_response.asset.acl
        )
      rescue StandardError => e
        Rails.logger.error("Unable to copy media_response with id #{media_response.id}. #{e.message}")
        return
      end

      new_media_response = media_response.dup
      new_media_response.users_result_id = to_user_result.id
      new_media_response.save!
      new_media_response.update_column(:asset, filename)
    end
  end
end

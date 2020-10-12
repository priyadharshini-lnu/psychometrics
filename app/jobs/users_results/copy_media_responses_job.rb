# frozen_string_literal: true

module UsersResults
  class CopyMediaResponsesJob < ApplicationJob
    def perform(from_user_result, to_user_result)
      from_user_result.media_responses.each do |media_response|
        copy_single_media_response(media_response, to_user_result)
      end
    end

    def copy_single_media_response(media_response, to_user_result)
      filename = "#{SecureRandom.uuid}/#{media_response.filename}"

      begin
        Aws::S3::Client.new.copy_object(
          bucket: Rails.application.secrets.directory,
          copy_source: "#{Rails.application.secrets.directory}/#{media_response.asset.path}",
          key: "uploads/media_response/asset/#{filename}",
          acl: media_response.asset.acl
        )
      rescue StandardError => e
        Rails.logger.error("Unable to copy media_response with id #{media_response.id}", e.message)
        return
      end

      new_media_response = media_response.dup
      new_media_response.users_result_id = to_user_result.id
      new_media_response.save!
      new_media_response.update_column(:asset, filename)
    end
  end
end

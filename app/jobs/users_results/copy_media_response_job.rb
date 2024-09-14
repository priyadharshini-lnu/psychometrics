# frozen_string_literal: true

module UsersResults
  class CopyMediaResponseJob < ApplicationJob
    def perform(media_response, to_user_result)
      begin
        blob_data = media_response.asset.blob.download

        new_blob = ActiveStorage::Blob.create_and_upload(
          io: StringIO.new(blob_data),
          filename: filename,
          key: new_media_response.attachment_storage_path('asset', media_response.filename),
          service_name: Settings.storage.private_storage_service,
          content_type: media_response.asset.content_type
        )

        new_media_response.asset.attach(new_blob)
      rescue StandardError => e
        Rails.logger.error("Unable to copy media_response with id #{media_response.id}. #{e.message}")
        return
      end

      new_media_response = media_response.dup
      new_media_response.users_result_id = to_user_result.id
      new_media_response.save!
      new_blob.update!(key: new_media_response.attachment_storage_path('asset', filename))
      new_media_response.asset.attach(new_blob)
      new_media_response.update_columns(user_selected: media_response.user_selected)
    end
  end
end

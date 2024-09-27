# frozen_string_literal: true

module UsersResults
  class CopyMediaResponseJob < ApplicationJob
    def perform(media_response, to_user_result)
      MediaResponse.transaction do
        new_media_response = media_response.dup
        new_media_response.users_result_id = to_user_result.id
        new_media_response.user_selected = media_response.user_selected
        new_media_response.save!

        begin
          new_media_response.copy_and_upload(media_response.asset, :asset)
        rescue StandardError => e
          Rails.logger.error("Unable to copy media_response with id #{media_response.id}. #{e.message}")
          raise ActiveRecord::Rollback
        end
      end
    end
  end
end

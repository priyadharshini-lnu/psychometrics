# frozen_string_literal: true

module UsersResults
  class CopyMediaResponseJob < ApplicationJob
    def perform(media_response, to_user_result, transcription_text = nil)
      new_media_response = duplicate_media_response(media_response)
      return unless new_media_response

      assign_basic_attributes(new_media_response, media_response, to_user_result)
      build_transcription_if_needed(new_media_response, media_response, transcription_text)
      handle_post_save_actions(new_media_response, to_user_result)

      new_media_response
    end

    private

    def duplicate_media_response(media_response)
      new_media_response = media_response.dup
      begin
        new_media_response.copy_and_upload(media_response.asset, :asset)
      rescue StandardError => e
        Rails.logger.error("Unable to copy media_response with id #{media_response.id}. #{e.message}")
        return nil
      end
      new_media_response
    end

    def assign_basic_attributes(new_media_response, media_response, to_user_result)
      new_media_response.users_result_id = to_user_result.id
      new_media_response.user_selected = media_response.user_selected
    end

    def build_transcription_if_needed(new_media_response, media_response, transcription_text)
      if transcription_text.present? || media_response.transcription&.completed?
        new_media_response.build_transcription(
          text: transcription_text || media_response&.transcription&.text,
          status: :completed
        )
      end
    end

    def handle_post_save_actions(new_media_response, to_user_result)
      if new_media_response.save! && new_media_response.transcription&.text.blank?
        user_assessment = to_user_result.user_assessment.reload
        user_assessment.enqueue_media_response_transcriptions if user_assessment.completed?
      end
    end
  end
end

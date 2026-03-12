# frozen_string_literal: true

module  MediaResponses
  class FindOrCreateMediaResponseByUserResult < BaseCommand
    private_attr_reader :media_record, :user_result, :question, :transcription_text

    def initialize(media_record, user_result, question, transcription_text = nil)
      @media_record = media_record
      @user_result  = user_result
      @question     = question
      @transcription_text = transcription_text
    end

    def call
      record = if same_question_and_user_result?
                 media_record
               elsif existing_media_response.present?
                 existing_media_response
               elsif media_belongs_to_same_project?
                 UsersResults::CopyMediaResponseJob.perform_later(media_record, user_result, transcription_text)
               end

      if transcription_text.present? && record.respond_to?(:save_transcription_completed!)
        record.save_transcription_completed!(transcription_text)
      end

      broadcast :ok, record
    end

    private

    def media_belongs_to_same_project?
      users_result = media_record&.users_result
      subject = users_result&.subject
      media_project_id = subject&.project_id
      user_project_id = user_result.subject&.project_id
      media_project_id == user_project_id
    end

    def same_question_and_user_result?
      media_record&.users_result == user_result && media_record&.question == question
    end

    def existing_media_response
      MediaResponse.find_by(users_result: user_result, question: question)
    end
  end
end

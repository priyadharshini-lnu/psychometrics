# frozen_string_literal: true

module  MediaResponses
  class FindOrCreateMediaResponseByUserResult < BaseCommand
    private_attr_reader :media_record, :user_result, :question

    def initialize(media_record, user_result, question)
      @media_record = media_record
      @user_result  = user_result
      @question     = question
    end

    def call
      record = if same_question_and_assign?
                 media_record
               elsif media_belongs_to_same_project?
                 UsersResults::CopyMediaResponseJob.perform_later(media_record, user_result)
               end
      broadcast :ok, record
    end

    private

    def media_belongs_to_same_project?
      media_record&.users_result&.subject&.project_id == user_result.subject&.project_id
    end

    def same_question_and_assign?
      media_record&.users_result == user_result && media_record&.question == question
    end
  end
end

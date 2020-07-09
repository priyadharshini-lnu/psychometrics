# frozen_string_literal: true

module  MediaResponses
  class FindOrCreateMediaResponse < BaseCommand
    private_attr_reader :media_record, :assign, :question

    def initialize(media_record, assign, question)
      @media_record = media_record
      @assign       = assign
      @question     = question
    end

    def call
      record = if same_question_and_assign?
                 media_record
               elsif media_belongs_to_same_project?
                 new_media_record = media_record.dup
                 new_media_record.question_id = question.id
                 new_media_record.assign_id = assign.id
                 new_media_record.save!
                 new_media_record
               end
      broadcast :ok, record
    end

    private

    def media_belongs_to_same_project?
      media_record&.assign&.project_id == assign.project_id
    end

    def same_question_and_assign?
      media_record&.assign == assign && media_record&.question == question
    end
  end
end

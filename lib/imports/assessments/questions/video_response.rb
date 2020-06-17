# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class VideoResponse
        def self.build_answers(data, question, _use_scoring = false, assign)
          return nil if data.compact.blank?

          {
            answers: video_answers(data, assign, question),
            question_id: question.id
          }
        end

        def self.video_answers(data, assign, question)
          decoded_media_ids = decode_media_ids(data[1])
          answers = []

          decoded_media_ids.each_with_index do |media_id, index|
            answer = {}
            media_record = MediaResponses::FindOrCreateMediaResponse.call!(media_id, assign, question)

            next unless media_record

            answer['value'] = media_record.asset.url
            answer['take_no'] = index + 1
            answer['media_id'] = media_record.id
            answer['user_selected'] = media_record.user_selected
            answers << answer
          end
          answers
        end

        def self.decode_media_ids(media_ids)
          decoded_media_ids = []
          media_ids.split(', ').each do |media_id|
            decoded_media_ids << MediaResponse.decode_id(media_id)
          end
          decoded_media_ids
        end
      end
    end
  end
end

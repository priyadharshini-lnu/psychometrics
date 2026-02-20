# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class VideoResponse
        def self.build_answers(data, question, duration, _use_scoring = false, assign)
          return nil if data.compact.blank?

          {
            answers: video_answers(data, assign, question),
            question_id: question.id,
            duration: duration
          }
        end

        def self.video_answers(data, assign, question)
          decoded_media_ids = decode_media_ids(data[3])
          MediaResponse.where(id: decoded_media_ids).order(:created_at).each do |media_record|
            MediaResponses::FindOrCreateMediaResponseByUserResult.call!(media_record, assign, question, data[1])
          end
          nil
        end

        def self.decode_media_ids(media_ids)
          decoded_media_ids = media_ids.split(', ').map do |media_id|
            MediaResponse.decode_id(media_id)
          end
          decoded_media_ids.flatten
        end
      end
    end
  end
end

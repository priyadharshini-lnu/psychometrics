# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class VideoResponse
        # rubocop:disable Metrics/ParameterLists
        def self.build_answers(data, question, duration, _use_scoring = false, assign, import_media_from_url: false)
          return nil if data.compact.blank?

          if import_media_from_url && data[0].present?
            video_answers_from_external(data, assign, question)
          elsif data[3].present?
            video_answers_from_media_ids(data, assign, question)
          else
            return nil
          end

          {
            question_id: question.id,
            duration: duration
          }
        end
        # rubocop:enable Metrics/ParameterLists

        def self.video_answers_from_external(data, assign, question)
          MediaResponses::DownloadFromUrlJob.perform_later(
            data[0],
            assign,
            question,
            data[1],
            user_selected: true
          )
        end

        def self.video_answers_from_media_ids(data, assign, question)
          decoded_media_ids = decode_media_ids(data[3])
          MediaResponse.where(id: decoded_media_ids).order(:created_at).each do |media_record|
            MediaResponses::FindOrCreateMediaResponseByUserResult.call!(media_record, assign, question, data[1])
          end
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

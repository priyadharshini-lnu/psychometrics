# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class VideoResponse < Base
        include ImportExportConst

        def self.result(user_result, question, **_args)
          media_responses = user_result.media_responses.where(question: question)
          return Utility::Array.ensure_size([], question_header_size(question)) if media_responses.blank?

          duration = get_duration(user_result, question)
          answers = video_response_answers(media_responses, duration)
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.video_response_answers(media_responses, duration)
          selected_media = media_responses.find(&:user_selected?)
          selected_video_url = selected_media&.asset&.url(expires_in: 1.week)
          selected_transcription = selected_media&.transcription&.text

          [
            selected_video_url,
            selected_transcription,
            all_takes_urls(media_responses),
            all_takes_encoded_media_ids(media_responses),
            duration
          ]
        end

        def self.user_selected_url(media_responses)
          media_responses.find(&:user_selected?)&.asset&.url(expires_in: 1.week)
        end

        def self.all_takes_urls(media_responses)
          media_responses.each_with_object([]) do |media_response, data|
            next if media_response.user_selected?

            data << media_response&.asset&.url(expires_in: 1.week)
          end.join("\r\n")
        end

        def self.all_takes_encoded_media_ids(media_responses)
          media_responses.each_with_object([]) do |media_response, data|
            data << media_response.encoded_id
          end.join(', ')
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          VIDEO_IMPORT_EXPORT_FIELDS.each do |file_upload_field|
            question_id_header << "QID#{question.id}_#{file_upload_field}"
            question_choices_header << file_upload_field
          end
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end

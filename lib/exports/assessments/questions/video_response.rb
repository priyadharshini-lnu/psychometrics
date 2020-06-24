# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class VideoResponse < Base
        def self.result(results, question, _scoring = false, _export_with_labels = false)
          answers = results[question.id.to_s].try(:[], 'answers')

          if answers.present?
            answers = video_response_answers(answers)
            Utility::Array.ensure_size(answers, question_header_size(question))
          end
        end

        def self.video_response_answers(answers)
          [
            all_takes_urls(answers),
            all_takes_encoded_media_ids(answers)
          ]
        end

        def self.all_takes_urls(answers)
          answers.each_with_object([]) do |answer, data|
            data << answer['value']
          end.join("\r\n")
        end

        def self.all_takes_encoded_media_ids(answers)
          answers.each_with_object([]) do |answer, data|
            data << MediaResponse.encode_id(answer['media_id'])
          end.join(', ')
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          MediaResponse::IMPORT_EXPORT_FIELDS.each do |file_upload_field|
            question_id_header << "QID#{question.id}_#{file_upload_field}"
            question_choices_header << file_upload_field
          end
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end

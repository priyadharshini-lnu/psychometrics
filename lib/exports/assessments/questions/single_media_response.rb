# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class SingleMediaResponse < Base
        include ImportExportConst

        def self.result(user_result, question, _scoring = false, _export_with_labels = false)
          media_response = user_result.media_responses.where(question: question).last
          return Utility::Array.ensure_size([], question_header_size(question)) if media_response.nil?

          duration = get_duration(user_result, question)
          answers = media_response_answers(media_response, duration)
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.media_response_answers(media_response, duration)
          [
            media_response.asset.url(expires_in: 1.week),
            media_response.encoded_id,
            duration
          ]
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          SINGLE_MEDIA_IMPORT_EXPORT_FIELDS.each do |file_upload_field|
            question_id_header << "QID#{question.id}_#{file_upload_field}"
            question_choices_header << file_upload_field
          end
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end

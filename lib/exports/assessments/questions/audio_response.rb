# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class AudioResponse < Base
        include ImportExportConst

        def self.result(answers, question, _scoring = false, _export_with_labels = false, _not_applicable)
          if answers.present?
            answers = audio_response_answers(answers[0])
            Utility::Array.ensure_size(answers, question_header_size(question))
          end
        end

        def self.audio_response_answers(answers)
          [
            answers['value'],
            MediaResponse.encode_id(answers['media_id'])
          ]
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          IMPORT_EXPORT_FIELDS.each do |file_upload_field|
            question_id_header << "QID#{question.id}_#{file_upload_field}"
            question_choices_header << file_upload_field
          end
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end

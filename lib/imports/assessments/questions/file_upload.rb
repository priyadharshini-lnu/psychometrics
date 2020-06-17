# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class FileUpload
        def self.build_answers(data, question, _use_scoring = false, assign)
          return nil if data.compact.blank?

          decoded_media_id = MediaResponse.decode_id(data[1])
          media_record = MediaResponses::FindOrCreateMediaResponse.call!(decoded_media_id, assign, question)

          return unless media_record

          {
            answers: [{
              value: media_record.asset.url,
              file_name: media_record.filename,
              media_id: media_record.id
            }],
            question_id: question.id
          }
        end
      end
    end
  end
end

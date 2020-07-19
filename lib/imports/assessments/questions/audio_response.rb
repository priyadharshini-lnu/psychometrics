# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class AudioResponse
        def self.build_answers(data, question, _use_scoring = false, assign)
          return nil if data.compact.blank?

          media_record = MediaResponse.find_by_encoded_id(data[1])
          media_record_to_import = MediaResponses::FindOrCreateMediaResponse.call!(media_record, assign, question)

          return unless media_record_to_import

          {
            answers: [{
              value: media_record_to_import.asset.url,
              file_name: media_record_to_import.filename,
              media_id: media_record_to_import.id
            }],
            question_id: question.id
          }
        end
      end
    end
  end
end

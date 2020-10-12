# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class SingleMediaResponse
        def self.build_answers(data, question, _use_scoring = false, assign)
          return nil if data.compact.blank?
          return nil if data[1].blank?

          media_record = MediaResponse.find_by_encoded_id(data[1])
          if assign.is_a?(Assign)
            MediaResponses::FindOrCreateMediaResponse.call!(media_record, assign, question)
          else
            MediaResponses::FindOrCreateMediaResponseByUserResult.call!(media_record, assign, question)
          end

          nil
        end
      end
    end
  end
end

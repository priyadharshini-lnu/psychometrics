# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class SingleMediaResponse
        def self.build_answers(data, question, duration, _use_scoring = false, assign)
          return nil if data.compact.blank?
          return nil if data[1].blank?

          media_record = MediaResponse.find_by_encoded_id(data[1]) # rubocop:disable Rails/DynamicFindBy
          MediaResponses::FindOrCreateMediaResponseByUserResult.call!(media_record, assign, question)

          {
            duration: duration
          }
        end
      end
    end
  end
end

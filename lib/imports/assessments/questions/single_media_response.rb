# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class SingleMediaResponse
        # rubocop:disable Metrics/ParameterLists
        def self.build_answers(data, question, duration, _use_scoring = false, assign, import_media_from_url: false)
          return nil if data.compact.blank?

          if import_media_from_url && data[0].present?
            create_from_media_url(data, question, assign)
          elsif data[2].present?
            create_from_media_id(data, question, assign)
          else
            return nil
          end

          {
            duration: duration
          }
        end
        # rubocop:enable Metrics/ParameterLists

        def self.create_from_media_url(data, question, assign)
          MediaResponses::DownloadFromUrlJob.perform_later(
            data[0],
            assign,
            question,
            data[1]
          )
        end

        def self.create_from_media_id(data, question, assign)
          media_record = MediaResponse.find_by_encoded_id(data[2]) # rubocop:disable Rails/DynamicFindBy
          MediaResponses::FindOrCreateMediaResponseByUserResult.call!(media_record, assign, question)
        end
      end
    end
  end
end

# frozen_string_literal: true

module Assessments
  module QuestionsImport
    module QuestionPropertyForm
      class VideoResponse < Base
        mimic :questions_import_video_response_form

        attribute :duration, Integer
        attribute :maxTakes, Integer
        attribute :scoreWithAIEnabled, String
        attribute :enableTranscription, String
        attribute :aiScoringModelAnswer, String
        attribute :aiScoringKeywords, String

        def default_values
          {
            'duration' => 120,
            'maxTakes' => 3
          }
        end

        def attributes
          attrs = super
          attrs['scoreWithAIEnabled'] = to_boolean(attrs[:scoreWithAIEnabled])
          attrs['enableTranscription'] = to_boolean(attrs[:enableTranscription])
          attrs
        end

        private

        def to_boolean(value)
          ActiveModel::Type::Boolean.new.cast(value)
        end
      end
    end
  end
end

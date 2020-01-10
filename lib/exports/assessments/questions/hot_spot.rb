# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class HotSpot < Base
        # FROM:
        #   [{
        #     "value": true/false/null,
        #     "region": 0
        #   }]
        # TO
        #   ['Like or On/Dislike/Neutral or OFF']
        def self.result(answers, question, _scoring = false)
          parsed_result = []
          question.props['regions'].size.times do |r|
            answer = (answers || []).detect { |a| a['region'] == r }
            parsed_result << if question.props['interactivity'] == 'Liker'
                               case answer.try(:[], 'value')
                                 when nil
                                   'Neutral'
                                 when true
                                   'Like'
                                 else
                                   'Dislike'
                               end
                             else
                               (answer.try(:[], 'value') ? 'On' : 'Off')
                             end
          end
          Utility::Array.ensure_size(parsed_result, question_header_size(question))
        end

        def self.headers_by_choices(question)
          question_id_header = []
          question_choices_header = []
          question.props['regions'].length.times do |i|
            question_id_header << "QID#{question.id}_#{i + 1}"
            question_choices_header << question.props.dig('regionsNames', i)
          end
          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end

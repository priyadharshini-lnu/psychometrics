# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class HotSpot
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
          required_size = header(question).size
          Utility::Array.ensure_size(parsed_result, required_size)
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          question.props['regions'].size.times do |r|
            parsed_header << "QID#{question.id}_#{r + 1}"
          end
          parsed_header
        end
      end
    end
  end
end

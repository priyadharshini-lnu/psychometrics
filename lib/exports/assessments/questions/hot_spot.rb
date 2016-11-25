module Exports
  module Assessments
    module Questions
      class HotSpot
        # Parse RESULT data for XLSX
        def self.result(answers, question)
          parsed_result = []
          question.props['regions'].size.times do |r|
            answer = (answers || []).detect { |a| a['region'] == r }
            if question.props['interactivity'] == 'Liker'
              parsed_result << case answer.try(:[], 'value')
                               when nil
                                 'Neutral'
                               when true
                                 'Like'
                               else
                                 'Dislike'
                               end
            else
              parsed_result << (answer.try(:[], 'value') ? 'On' : 'Off')
            end
          end
          parsed_result
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

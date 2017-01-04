module Exports
  module Assessments
    module Questions
      class TextEntry
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 'Value'
        #   }, ...]
        # TO:
        #   ['Value']
        def self.result(answers, question)
          factors_scoring = question.detect_specified_scoring.
                            inject({}) { |sum, s| sum[s['index']] = s['value']; sum }
          (answers || []).map { |a| factors_scoring[a['value']] || a['value'] }
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          if %w(Form).include?(question.props['type'])
            question.props['choices'].to_i.times do |c|
              parsed_header << "QID#{question.id}_#{c + 1}"
            end
          else
            parsed_header << "QID#{question.id}"
          end
          parsed_header
        end
      end
    end
  end
end

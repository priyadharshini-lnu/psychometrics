module Exports
  module Assessments
    module Questions
      class RankOrder
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 0
        #   }, ...]
        # TO:
        #   [1, ...]
        def self.result(answers, question, _scoring = false)
          increase = %w(TextBox).include?(question.props['type']) ? 0 : 1
          answers = (answers || []).sort_by { |a| a['index'] }.map { |a| a['value'] + increase }
          required_size = header(question).size
          Utility::Array.ensure_size(answers, required_size)
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          question.props['choices'].to_i.times do |c|
            parsed_header << "QID#{question.id}_#{c + 1}"
          end
          parsed_header
        end
      end
    end
  end
end

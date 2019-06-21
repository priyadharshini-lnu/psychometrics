module Exports
  module Assessments
    module Questions
      class ConstantSum
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 12
        #   }, ...]
        # TO:
        #   [12, ...]
        def self.result(answers, _question, _scoring = false)
          answers = (answers || []).map { |a| a['value'] }
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

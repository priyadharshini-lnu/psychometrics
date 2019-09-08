# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class Slider
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 12
        #   }, ...]
        # TO:
        #   [12, ...]
        def self.result(answers, question, scoring = false)
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
          required_size = question.props['choices'].to_i
          answers = (answers || []).map { |a| a['value'].is_a?(Numeric) ? (scoring && factors_scoring[a['index']] || 1) * a['value'] : '' }
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

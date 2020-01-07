# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class TextEntry < Base
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 'Value'
        #   }, ...]
        # TO:
        #   ['Value']

        def self.result(answers, question, scoring = false)
          # TODO: investigate single text entry save additional two empty answers
          # remove two additional empty answers
          remove_empty(answers) if answers.present? && single_answer?(answers) && remove_empty?(answers)
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
          answers = (answers || []).map { |a| scoring && factors_scoring[a['value']] || a['value'] }
          required_size = header(question).size
          Utility::Array.ensure_size(answers, required_size)
        end

        def self.result_label(answers, question)
          result(answers, question, true)
        end

        # Parse HEADER data for XLSX
        def self.header(question)
          parsed_header = []
          if %w[Form].include?(question.props['type'])
            question.props['choices'].to_i.times do |c|
              parsed_header << "QID#{question.id}_#{c + 1}"
            end
          else
            parsed_header << "QID#{question.id}"
          end
          parsed_header
        end

        def self.headers_by_choices(question)
          question_id_header = []
          question_choices_header = []

          if %w[Form].include?(question.props['type'])
            question.props['choices'].to_i.times do |c|
              question_id_header << "QID#{question.id}_#{c + 1}"
              question_choices_header << question.props.dig('choicesTexts', c)
            end
          else
            question_id_header << "QID#{question.id}"
          end

          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end

        def self.single_answer?(answers)
          answers.none? { |element| element.key?('index') }
        end

        def self.remove_empty?(answers)
          answers.size > 1 && answers.count { |element| element['value'] == '' } >= 1
        end

        def self.remove_empty(answers)
          answers.reject! { |element| element['value'] == '' }
        end
      end
    end
  end
end

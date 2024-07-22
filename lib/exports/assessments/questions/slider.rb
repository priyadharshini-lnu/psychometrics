# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class Slider < Base
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 12
        #   }, ...]
        # TO:
        #   [12, ...]
        def self.result(user_result, question, scoring = false, _export_with_labels = false) # rubocop:disable Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
          answers = get_answers(user_result, question) || []
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
          not_applicable = get_not_applicable(user_result, question) || {}
          na_label = question.props['notApplicableLabel'] || NOT_APPLICABLE_PLACEHOLDER

          answers = Array.new(question.props['choices'].to_i) do |c|
            a = answers.find do |answer|
              answer['index'] == c
            end || (not_applicable[c.to_s] ? { 'value' => na_label } : { 'value' => nil })
            if a['value'].is_a?(Numeric)
              ((scoring && factors_scoring[a['index']]) || 1) * a['value']
            else
              (a['value'] || '')
            end
          end

          answers = Array.new(question_headers_except_duration_size(question)) { '' } if answers.empty?
          answers << get_duration(user_result, question)
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          question.props['choices'].to_i.times do |c|
            question_id_header << "QID#{question.id}_#{c + 1}"
            question_choices_header << question.props.dig('choicesTexts', c)
          end
          append_duration_header(question, question_id_header, question_choices_header)

          { question_id_header: question_id_header, question_choice_header: question_choices_header }
        end
      end
    end
  end
end

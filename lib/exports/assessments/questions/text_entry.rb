# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class TextEntry < Base
        include ImportExportConst
        # FROM:
        #   [{
        #     "index": 0,
        #     "value": 'Value'
        #   }, ...]
        # TO:
        #   ['Value']

        def self.result(user_result, question, scoring = false, _export_with_labels = false)
          # TODO: investigate single text entry save additional two empty answers
          # remove two additional empty answers
          all_answers = []
          answers = get_answers(user_result, question)
          all_answers << if answers.present?
                           retrieve_answers(answers, question, scoring)
                         else
                           Array.new(question_headers_except_duration_size(question)) { '' }
                         end
          formatted_answers(user_result, question, all_answers)
        end

        def self.retrieve_answers(answers, question, scoring) # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
          if question.of_sub_type?('Email') && answers.present?
            email_type_answers(answers)
          else
            remove_empty(answers) if answers.present? && single_answer?(answers) && remove_empty?(answers)
            factors_scoring = question.detect_specified_scoring.
                              each_with_object({}) { |s, sum| sum[s['index']] = s['value']; }
            (answers || []).map { |a| (scoring && factors_scoring[a['value']]) || a['value'] }
          end
        end

        def self.email_type_answers(answers)
          EMAIL_QUESTION_FIELDS.each_with_object([]) do |email_field, data|
            data << (answers[email_field].is_a?(Array) ? answers[email_field].join(', ') : answers[email_field])
          end
        end

        def self.formatted_answers(user_result, question, answers)
          answers = if question.of_sub_type?('Chat')
                      [answers.join("\r\n")]
                    elsif question.of_sub_type?('Form')
                      form_answers = answers[0] || []
                      question.props['formTypes'].map.with_index do |form_type, i|
                        form_type['name'] == 'MultiSelect' ? (form_answers[i] || []).join(', ') : form_answers[i]
                      end
                    else
                      answers.flatten
                    end
          answers << get_duration(user_result, question)
          Utility::Array.ensure_size(answers, question_header_size(question))
        end

        def self.result_label(answers, question)
          answers = retrieve_answers(answers, question, false)
          question.of_sub_type?('Chat') ? answers.join("\r\n") : answers
        end

        def self.question_id_and_choice_headers(question)
          question_id_header = []
          question_choices_header = []
          if question.of_sub_type?('Form')
            question.props['choices'].to_i.times do |c|
              question_id_header << "QID#{question.id}_#{c + 1}"
              question_choices_header << question.props.dig('choicesTexts', c)
            end
          elsif question.of_sub_type?('Email')
            EMAIL_QUESTION_FIELDS.each do |email_field|
              question_id_header << "QID#{question.id}_#{email_field}"
              question_choices_header << email_field
            end
          else
            question_id_header << "QID#{question.id}"
            question_choices_header << ''
          end
          append_duration_header(question, question_id_header, question_choices_header)
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

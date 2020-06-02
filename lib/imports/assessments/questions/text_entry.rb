# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class TextEntry
        # FROM:
        #   ['Value']
        # TO:
        #   [{
        #     "index": 0,
        #     "value": 'Value'
        #   }, ...]

        def self.build_answers(data, question, use_scoring = false)
          return nil if data.compact.blank? || data.all?(&:blank?)

          answers = if question.of_sub_type?('Email')
                      build_email_answers(data)
                    elsif question.of_sub_type?('Chat')
                      build_chat_answers(data)
                    else
                      build_other_answers(data, question, use_scoring)
                    end

          {
            answers: answers,
            question_id: question.id
          }
        end

        def self.build_email_answers(data)
          answers = {}
          Question::EMAIL_QUESTION_FIELDS.each_with_index do |email_field, index|
            answers[email_field] = data[index].include?(', ') ? data[index].split(', ') : data[index]
          end
          answers
        end

        def self.build_chat_answers(data)
          data.each_with_object([]) do |answer, formatted_answers|
            splitted_answers = answer.split("\n")
            splitted_answers.each_with_index do |value, index|
              formatted_answers << {
                index: index,
                value: value
              }
            end
          end
        end

        def self.build_other_answers(data, question, use_scoring)
          factors_scoring = question.detect_specified_scoring.
                            each_with_object({}) { |s, sum| sum[s['value']] = s['index']; }
          answers = []
          data.each_with_index do |value, index|
            answers << {
              index: index,
              value: use_scoring && factors_scoring[value] || value
            }
          end
        end
      end
    end
  end
end

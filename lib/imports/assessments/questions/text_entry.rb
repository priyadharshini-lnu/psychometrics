# frozen_string_literal: true

module Imports
  module Assessments
    module Questions
      class TextEntry
        include ImportExportConst

        # FROM:
        #   ['Value']
        # TO:
        #   [{
        #     "index": 0,
        #     "value": 'Value'
        #   }, ...]

        def self.build_answers(data, question, duration, use_scoring = false, _assign, **) # rubocop:disable Metrics/ParameterLists
          return nil if data.compact.blank? || data.all?(&:blank?)

          answers = case question.props['type']
                      when 'Email'
                        build_email_answers(data)
                      when 'Chat'
                        build_chat_answers(data)
                      when 'SingleLine'
                        build_single_line_answer(data)
                      else
                        build_other_answers(data, question, use_scoring)
                    end

          {
            answers: answers,
            question_id: question.id,
            duration: duration
          }
        end

        def self.build_single_line_answer(data)
          data.each_with_object([]) do |answer, formatted_answers|
            formatted_answers << {
              value: answer
            }
          end
        end

        def self.build_email_answers(data)
          answers = {}
          EMAIL_QUESTION_FIELDS.each_with_index do |email_field, index|
            answers[email_field] = if EMAIL_QUESTION_TEXT_FIELDS.include?(email_field)
                                     data[index]
                                   else
                                     data[index] && data[index].split(';')
                                   end
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
                            each_with_object({}) { |s, sum| sum[s['value']] = s['index'] }
          answers = []
          data.each_with_index do |value, index|
            answers << {
              index: index,
              value: (use_scoring && factors_scoring[value]) || value
            }
          end
          answers
        end
      end
    end
  end
end

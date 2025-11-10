# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class Base
        include ImportExportConst

        def self.headers(question)
          all_headers = question_id_and_choice_headers(question)
          question_text = ActionView::Base.full_sanitizer.sanitize(question.props['questionText'])
          question_name_header = [question.name] * all_headers[:question_id_header].size
          question_text_header = [question_text] * all_headers[:question_id_header].size
          all_headers.merge!(question_name_header: question_name_header, question_text_header: question_text_header)
        end

        def self.question_id_and_choice_headers(question)
          if respond_to?(:question_id_header)
            question_id_header = self.question_id_header(question)
            { question_id_header: question_id_header, question_choice_header: ([''] * question_id_header.length) }
          else
            raise NoMethodError
          end
        end

        def self.question_header_size(question)
          question_id_and_choice_headers(question)[:question_id_header].size
        end

        def self.question_headers_except_duration_size(question)
          question_id_and_choice_headers(question)[:question_id_header].size - 1
        end

        def self.get_answers(result, question)
          result.answers[question.id.to_s].try(:[], 'answers')
        end

        def self.get_not_applicable(result, question)
          result.answers[question.id.to_s].try(:[], 'not_applicable')
        end

        def self.get_duration(result, question)
          result.answers[question.id.to_s].try(:[], 'duration')
        end

        def self.append_duration_header(question, id_header, choices_header)
          id_header << duration_header(question)
          choices_header << ''
        end

        def self.duration_header(question)
          "QID#{question.id}_#{DURATION}"
        end
      end
    end
  end
end

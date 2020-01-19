# frozen_string_literal: true

module Exports
  module Assessments
    module Questions
      class Base
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
      end
    end
  end
end

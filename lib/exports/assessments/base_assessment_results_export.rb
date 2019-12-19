# frozen_string_literal: true

module Exports
  module Assessments
    class BaseAssessmentResultsExport < BaseCommand
      QUESTIONS = %w[ConstantSum GapAnalysis GraphicSlider HotSpot
                     MatrixTable MetaInfo MultipleChoice PickGroupRank
                     RankOrder SideBySide Slider TextEntry Timing].freeze

      private_attr_accessor :assessment

      def get_xlsx_export_result
        Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'AssessmentRawResults') do |sheet|
            result_details_header = get_result_details_header

            get_all_headers(all_questions, result_details_header).each do |header|
              sheet.add_row header.flatten
            end

            results.
              find_each(batch_size: 100) do |result|
              user_results = []
              if result.results
                all_questions.each do |question|
                  answers = result.results[question.id.to_s].try(:[], 'answers')
                  next unless QUESTIONS.include?(question.type)

                  parser = "Exports::Assessments::Questions::#{question.type}".constantize
                  user_results << parser.result(answers, question, @scoring)
                end
              end

              user_results_flattened = user_results.map { |a| a == [] ? '' : a }.flatten

              sheet.add_row [*result_details_row_values(result), *user_results_flattened]
            end
          end
        end
      end

      private

      def all_questions
        @all_questions ||= Question.
                           joining { block }.
                           not_deleted.
                           includes(:factors_scorings).
                           selecting { [id, name, type, props] }.
                           where.has { |q| q.block.assessment_id == assessment.id }.
                           ordering { [block.position.asc, position.asc] }
      end

      def get_all_headers(questions, result_details_header)
        question_name_header = [''] * result_details_header.count
        question_text_header = [''] * result_details_header.count
        questions.each do |question|
          next unless QUESTIONS.include?(question.type)

          parser = "Exports::Assessments::Questions::#{question.type}".constantize
          question_header = parser.header(question)
          result_details_header << question_header

          question_name_header << Array.new(question_header.size) { |_i| question.name }
          question_text_header << Array.new(question_header.size) do |_i|
            ActionView::Base.full_sanitizer.sanitize(question.props['questionText'])
          end
        end
        [result_details_header, question_name_header, question_text_header]
      end
    end
  end
end

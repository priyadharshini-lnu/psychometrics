# frozen_string_literal: true

module Exports
  module Assessments
    class BaseAgileAssessmentResultsExport < BaseCommand
      private_attr_accessor :assessment

      def get_xlsx_export_result

        config = Agile.find_by_assessment_id(assessment_id).try(:config)

        Axlsx::Package.new do |package|
          package.use_shared_strings = true
          workbook = package.workbook
          wrap = workbook.styles.add_style alignment: { wrap_text: true }

          questions = get_questions(config, 'AssessmentScene')

          headers = result_details_header + question_headers(questions)

          workbook.add_worksheet(name: 'AgileAssessmentRawResults') do |sheet|
            sheet.add_row headers.flatten

            results.
              find_each(batch_size: 100) do |result|
              sheet.add_row prepare_score_data(result, questions).flatten, style: wrap if result.answers
            end
          end
        end
      end

      private

      def result_details_header
        [
          'ID',
          'Project',
          'First Name',
          'Last Name',
          'Email',
          'Assessment ID',
          'completed_at',
          'Assessment Name',
          ''
        ]
      end

      def get_questions(config, scene_type)
        config['groups'].collect { |group| group['scenes'].select { |s| s['type'] == scene_type } }.
          select { |s| s.size.positive? }.
          flatten(1).
          flat_map { |s| s.dig('data', 'blocks') }.
          flat_map { |b| b['questions'] }.
          collect { |q| q['id'] }
      end

      def prepare_score_data(result, questions)
        res = result.answers || {}
        row_values = result_details_row_values(result)

        answers_by_id = res.inject({}) { |obj, g| obj.merge(g['answers']) }

        result_values = questions.map do |q|
          [answers_by_id.dig(q, 'answers')&.join(','), answers_by_id.dig(q, 'duration')]
        end.flatten

        row_values + result_values
      end

      def question_headers(questions)
        questions.map { |q| ["#{q}.answers", "#{q}.duration"] }.flatten
      end
    end
  end
end

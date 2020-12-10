# frozen_string_literal: true

module Exports
  module Assessments
    class AgileAssessmentResultsExport < BaseCommand
      attr_accessor :assessment_id

      def initialize(assessment, client_id)
        @client_id = client_id
        @assessment_id = assessment.id
      end

      def call
        results = Assign.joins(membership: %i[client user]).includes(:assessment, membership: %i[client user]).where(
          'clients.ancestry_depth = 1 and assessment_id = (?) and assigns.status IN (?)', assessment_id, [1, 2]
        )
        config = Agile.find_by_assessment_id(assessment_id).try(:config)
        Axlsx::Package.new do |package|
          package.use_shared_strings = true
          workbook = package.workbook
          header_style = workbook.styles.add_style b: true
          workbook.add_worksheet(name: 'Assessment') do |sheet|
            questions = get_questions(config, 'AssessmentScene')
            sheet_data = prepare_score_data(results, questions)
            sheet.add_row(sheet_data[:headers], style: header_style, widths: [:auto])
            sheet_data[:rows].each { |row| sheet.add_row(row, widths: [:auto]) }
          end
        end
      end

      def get_questions(config, scene_type)
        config['groups'].collect { |group| group['scenes'].select { |s| s['type'] == scene_type } }.
          select { |s| s.size.positive? }.
          flatten(1).
          flat_map { |s| s.dig('data', 'blocks') }.
          flat_map { |b| b['questions'] }.
          collect { |q| q['id'] }
      end

      def prepare_score_data(results, questions)
        sheet_headers = result_details_header + question_headers(questions)

        sheet_rows = []

        results.each do |row|
          res = row.results || {}
          row_values = result_details_row_values(row)

          answers_by_id = res.inject({}) { |obj, g| obj.merge(g['answers']) }

          result_values = questions.map do |q|
            [answers_by_id.dig(q, 'answers')&.join(','), answers_by_id.dig(q, 'duration')]
          end.flatten

          sheet_rows << (row_values + result_values)
        end

        { headers: sheet_headers, rows: sheet_rows }
      end

      def result_details_header
        [
          'Assign ID',
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

      def question_headers(questions)
        questions.map { |q| ["#{q}.answers", "#{q}.duration"] }.flatten
      end

      def result_details_row_values(assign)
        [
          assign.encode_id,
          assign.membership.client.name,
          assign.user.first_name,
          assign.user.last_name,
          assign.user.email,
          assign.assessment_id,
          assign.completed_at.try(:strftime, '%D %r'),
          assign.assessment.name,
          ''
        ]
      end
    end
  end
end

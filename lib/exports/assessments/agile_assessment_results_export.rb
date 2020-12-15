# frozen_string_literal: true

module Exports
  module Assessments
    class AgileAssessmentResultsExport < BaseCommand
      private_attr_accessor :assessment_id, :client_id

      def initialize(assessment, client_id)
        @client_id = client_id
        @assessment_id = assessment.id
      end

      def call
        xlsx = get_xlsx_export_result
        broadcast :ok, xlsx
      end

      private

      def get_xlsx_export_result
        results = Assign.joins(membership: %i[client user]).includes(
          %i[user assessment], membership: %i[client user]
        ).where(
          'assessment_id = (?) and assigns.status IN (?) and memberships.client_id = (?)',
          assessment_id, [1, 2], client_id
        )
        config = Agile.find_by_assessment_id(assessment_id).try(:config)
        Axlsx::Package.new do |package|
          package.use_shared_strings = true
          workbook = package.workbook
          wrap = workbook.styles.add_style alignment: { wrap_text: true }

          questions = get_questions(config, 'AssessmentScene')

          headers = result_details_header + question_headers(questions)

          workbook.add_worksheet(name: 'AgileAssessmentRawResults') do |sheet|
            sheet.add_row headers.flatten

            results.each do |result|
              sheet.add_row prepare_score_data(result, questions).flatten, style: wrap
            end
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

      def prepare_score_data(result, questions)
        res = result.results || {}
        row_values = result_details_row_values(result)

        answers_by_id = res.inject({}) { |obj, g| obj.merge(g['answers']) }

        result_values = questions.map do |q|
          [answers_by_id.dig(q, 'answers')&.join(','), answers_by_id.dig(q, 'duration')]
        end.flatten

        row_values + result_values
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

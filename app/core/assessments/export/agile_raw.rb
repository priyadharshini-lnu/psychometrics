# frozen_string_literal: true

module Assessments
  module Export
    class AgileRaw < BaseCommand
      private_attr_accessor :assessment, :campaign

      FIXED_HEADERS = [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'Assessment ID',
        'Assessment Name',
        'Status',
        'Started At',
        'Completed At',
        'Completed Groups',
        'Norm',
        ''
      ].freeze

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      def call
        broadcast :ok, get_xlsx_export_result
      end

      def get_xlsx_export_result
        config = Agile.find_by_assessment_id(assessment.id).try(:config)

        Axlsx::Package.new do |package|
          package.use_shared_strings = true
          workbook = package.workbook
          wrap = workbook.styles.add_style alignment: { wrap_text: true }

          questions = get_question_ids(config, 'AssessmentScene')

          headers = FIXED_HEADERS + question_headers(questions)

          workbook.add_worksheet(name: 'AgileAssessmentRawResults') do |sheet|
            sheet.add_row headers.flatten

            results.
              find_each(batch_size: 100) do |result|
              sheet.add_row prepare_raw_data(result, questions).flatten, style: wrap if result.answers
            end
          end
        end
      end

      private

      def question_headers(questions)
        questions.map do |q|
          [
            "#{q}.group_id",
            "#{q}.id",
            "#{q}.answers",
            "#{q}.duration",
            "#{q}.session_id",
            "#{q}.start_time",
            "#{q}.end_time"
          ]
        end.flatten
      end

      def result_details_row_values(res)
        [
          res.encoded_id,
          res.subject.first_name,
          res.subject.last_name,
          res.subject.email,
          @assessment.id,
          @assessment.name,
          I18n.t("activerecord.attributes.users_result.statuses.#{res.real_status}", locale: :en),
          res.started_at.try(:strftime, '%D %r'),
          res.completed_at.try(:strftime, '%D %r'),
          res.meta_data['completed_groups']&.join(','),
          res.norm ? res.norm.name : '',
          ''
        ]
      end

      def get_question_ids(config, scene_type)
        config['groups'].collect { |group| group['scenes'].select { |scene| scene['type'] == scene_type } }.
          select { |scene| scene.size.positive? }.
          flatten(1).
          flat_map { |scene| scene.dig('data', 'blocks') }.
          flat_map { |blocks| blocks['questions'] }.
          collect { |question| question['id'] }
      end

      def prepare_raw_data(result, questions)
        res = result.answers || {}
        row_values = result_details_row_values(result)

        answers_by_id = res.inject({}) { |obj, group| obj.merge(group['answers']) }

        result_values = questions.map do |question|
          [
            answers_by_id.dig(question, 'group_id'),
            answers_by_id.dig(question, 'id'),
            answers_by_id.dig(question, 'answers')&.join(','),
            answers_by_id.dig(question, 'duration'),
            answers_by_id.dig(question, 'session_id'),
            readable_date(answers_by_id.dig(question, 'start_time')),
            readable_date(answers_by_id.dig(question, 'end_time'))
          ]
        end.flatten

        row_values + result_values
      end

      def readable_date(timestamp)
        if timestamp.present?
          DateTime.strptime(timestamp.to_s, '%Q').to_formatted_s(:rfc822)
        else
          ''
        end
      end

      def results
        UsersResult.includes(:user_assessment, :subject).
          where(user_assessments: { campaign_id: campaign.id, assessment_id: assessment.id })
      end
    end
  end
end

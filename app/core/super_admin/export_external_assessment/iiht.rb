# frozen_string_literal: true

module SuperAdmin
  module ExportExternalAssessment
    class Iiht < BaseCommand
      private_attr_accessor :assessment, :campaign_ids

      DEFAULT_HEADERS = [
        'Result ID', 'Project ID', 'Project Name', 'Campaign ID', 'Campaign Name', 'Subject Name', 'Subject Email',
        'Evaluator Name', 'Evaluator Email', 'Relationship', 'Started At', 'Completed At', 'Status'
      ].freeze
      RESULT_HEADERS_DATA = {
        'status' => 'Result',
        'attemptNumber' => 'Attempts',
        'duration' => 'Duration',
        'answeredQuestions' => 'AnsweredQuestions',
        'scorePercentage' => 'ScorePercentage'
      }.freeze

      def initialize(assessment, campaign_ids)
        @assessment = assessment
        @campaign_ids = campaign_ids
      end

      def call
        results =
          Axlsx::Package.new do |package|
            package.workbook.add_worksheet(name: 'ExternalResults') do |sheet|
              header_style = package.workbook.styles.add_style(b: true, sz: 14)
              sheet.add_row(DEFAULT_HEADERS + RESULT_HEADERS_DATA.values, style: header_style)

              users_results.find_each(batch_size: 100) do |res|
                content = RESULT_HEADERS_DATA.keys.map { |header| res.external_results&.dig(header) }
                sheet.add_row(default_content(res) + content)
              end
            end
          end

        broadcast :ok, results
      end

      private

      def default_content(res)
        [
          res.encoded_id,
          res.campaign.project.id,
          res.campaign.project.name,
          res.campaign.id,
          res.campaign.name,
          res.subject.decorate.full_name(seprator: ', '),
          res.subject.email,
          res.evaluator.decorate.full_name(seprator: ', '),
          res.evaluator.email,
          res.user_assessment.relationship.name,
          res.user_assessment.started_at.try(:strftime, '%D %r'),
          res.completed_at.try(:strftime, '%D %r'),
          I18n.t("activerecord.attributes.users_result.statuses.#{res.real_status}")
        ]
      end

      def users_results
        UsersResult.joins(:user_assessment).
          where(user_assessments: { campaign_id: campaign_ids, assessment_id: assessment.id, status: :completed }).
          includes(campaign: :project, user_assessment: :evaluator)
      end
    end
  end
end

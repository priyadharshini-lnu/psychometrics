# frozen_string_literal: true

module Assessments
  module Export
    class Pearson < BaseCommand
      private_attr_accessor :assessment, :campaign

      DEFAULT_HEADERS = [
        'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
        'Relationship', 'Started At', 'Completed At', 'Status'
      ].freeze

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      def call
        package = ExcelSafe.new
        package.add_worksheet('ExternalResults') do |sheet|
          header_style = sheet.workbook.styles.add_style(b: true, sz: 14)
          factor_names = users_results.find_by("external_results != '{}'")&.external_results&.map do |factor|
            factor['name']
          end || []

          sheet.add_row(DEFAULT_HEADERS + factor_names, style: header_style)

          users_results.find_each(batch_size: 100) do |res|
            content = factor_names.map do |factor_name|
              res.external_results&.find { |factors| factors['name'] == factor_name }.try(:[], 'value')
            end
            sheet.add_row(default_content(res) + content)
          end
        end

        broadcast :ok, package
      end

      private

      def default_content(res)
        subject_name = res.subject.decorate.full_name(seprator: ', ')
        subject_email = res.subject.email
        [
          res.encoded_id,
          subject_name,
          subject_email,
          subject_name,
          subject_email,
          'Self',
          res.user_assessment.started_at.try(:strftime, '%D %r'),
          res.user_assessment.completed_at.try(:strftime, '%D %r'),
          I18n.t("activerecord.attributes.users_result.statuses.#{res.real_status}")
        ]
      end

      def users_results
        UsersResult.joins(:user_assessment).
          where(user_assessments: { campaign_id: campaign.id, assessment_id: assessment.id }).
          merge(UserAssessment.scored).
          includes(user_assessment: :subject)
      end
    end
  end
end

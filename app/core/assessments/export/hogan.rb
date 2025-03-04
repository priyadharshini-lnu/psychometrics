# frozen_string_literal: true

module Assessments
  module Export
    class Hogan < BaseCommand
      private_attr_accessor :assessment, :campaign

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      def call
        package = ExcelSafe.new

        scores.each do |score|
          add_score(package, score)
        end

        broadcast :ok, package
      end

      private

      def scores
        [
          {
            sheet_name: 'Raw',
            score_type: 'rawScores',
            scale_type: 'scaleScores',
            value_field: 'scaleScore',
            factor_field: 'scaleName'
          },
          {
            sheet_name: 'percentileScales',
            score_type: 'percentileScores',
            scale_type: 'scaleScores',
            value_field: 'scaleScore',
            factor_field: 'scaleName'
          },
          {
            sheet_name: 'percentileSubScales',
            score_type: 'percentileScores',
            scale_type: 'subscaleScores',
            value_field: 'subscaleScore',
            factor_field: 'subscaleName'
          }
        ]
      end

      def add_score(package, score)
        package.add_worksheet(score[:sheet_name]) do |sheet|
          header_style = sheet.workbook.styles.add_style(b: true, sz: 14)
          headers = build_headers(score)
          sheet.add_row(default_headers + headers, style: header_style)

          users_results.find_each(batch_size: 100) do |res|
            content = build_data(res, score)
            sheet.add_row(default_content(res) + content)
          end
        end
      end

      def build_headers(score)
        sample = users_results.merge(UserAssessment.completed).find_by("external_results != '{}'")
        return [] unless sample

        (sample.external_results&.dig('scores', score[:score_type],
                                      score[:scale_type]) || []).pluck(score[:factor_field])
      end

      def build_data(res, score)
        (res.external_results&.dig('scores', score[:score_type], score[:scale_type]) || []).pluck(score[:value_field])
      end

      def default_content(res)
        [
          res.encoded_id,
          user_name(res),
          res.evaluator.email,
          I18n.t("activerecord.attributes.users_result.statuses.#{res.real_status}"),
          res.evaluator.hogan_credential&.participant_id,
          res.created_at&.strftime('%D %r'),
          res.completed_at&.strftime('%D %r')
        ]
      end

      def users_results
        UsersResult.joins(:user_assessment).
          where(user_assessments: { campaign_id: campaign.id, assessment_id: assessment.id }).
          includes(user_assessment: :evaluator)
      end

      def default_headers
        ['result ID', 'First and Last name', 'User email', 'Status', 'participant ID', 'started at', 'completed at']
      end

      def user_name(res)
        [res.user.first_name, res.user.last_name].compact_blank.join(', ')
      end
    end
  end
end

# frozen_string_literal: true

module SuperAdmin
  module ExportExternalAssessment
    class Hogan < BaseCommand
      private_attr_accessor :assessment, :campaign_ids

      def initialize(assessment, campaign_ids)
        @assessment = assessment
        @campaign_ids = campaign_ids
      end

      def call
        results =
          Axlsx::Package.new do |package|
            scores.each do |score|
              add_score(package, score)
            end
          end

        broadcast :ok, results
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
        package.workbook.add_worksheet(name: score[:sheet_name]) do |sheet|
          header_style = package.workbook.styles.add_style(b: true, sz: 14)
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

        (sample.external_results&.dig('scores', score[:score_type], score[:scale_type]) || []).map do |item|
          item[score[:factor_field]]
        end
      end

      def build_data(res, score)
        (res.external_results&.dig('scores', score[:score_type], score[:scale_type]) || []).map do |item|
          item[score[:value_field]]
        end
      end

      def default_content(res)
        [
          res.encoded_id,
          res.campaign.project.id,
          res.campaign.project.name,
          res.campaign.id,
          res.campaign.name,
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
          where(user_assessments: { campaign_id: campaign_ids, assessment_id: assessment.id }).
          includes(campaign: :project, user_assessment: :evaluator)
      end

      def default_headers
        [
          'Result ID', 'Project ID', 'Project Name', 'Campaign ID', 'Campaign Name', 'Full Name',
          'User email', 'Status', 'Participant ID', 'Started At', 'Completed at'
        ]
      end

      def user_name(res)
        [res.user.first_name, res.user.last_name].compact_blank.join(', ')
      end
    end
  end
end

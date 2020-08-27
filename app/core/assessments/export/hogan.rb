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
            score_type: 'RAW',
            scale_type: 'scale'
          },
          {
            sheet_name: 'percentileScales',
            score_type: 'percentile',
            scale_type: 'scale'
          },
          {
            sheet_name: 'percentileSubScales',
            score_type: 'percentile',
            scale_type: 'subscale'
          }
        ]
      end

      def add_score(package, score)
        package.workbook.add_worksheet(name: score[:sheet_name]) do |sheet|
          header_style = package.workbook.styles.add_style(b: true, sz: 14)
          headers = build_headers(score[:score_type], score[:scale_type])
          sheet.add_row(default_headers + headers, style: header_style)

          users_results.find_each(batch_size: 100) do |res|
            content = build_data(res, score[:score_type], score[:scale_type], '__content__')
            sheet.add_row(default_content(res) + content)
          end
        end
      end

      def build_headers(score_type, scale_type)
        headers = users_results.map do |res|
          build_data(res, score_type, scale_type, 'type')
        end
        headers.find(&:any?) || []
      end

      def build_data(res, score_type, scale_type, data_type)
        score = res.external_results&.dig('participant', 'assessment', 'score')&.find do |i|
          i['type'] == score_type
        end
        return [] if score.nil?

        data =
          if scale_type == 'scale'
            score.dig('scales', 'scale')
          elsif scale_type == 'subscale'
            score.dig('subscales', 'subscale')
          end

        return [] if data.nil?

        Array.wrap(data).map { |i| i[data_type] }
      end

      def default_content(res)
        [
          res.encoded_id,
          user_name(res),
          res.evaluator.email,
          res.evaluator.hogan_credential&.participant_id,
          res.created_at&.strftime('%D %r'),
          res.completed_at&.strftime('%D %r')
        ]
      end

      def users_results
        UsersResult.joins(:user_assessments).
          where(assessment_id: assessment.id, user_assessments: { campaign_id: campaign.id }).
          includes(:evaluator)
      end

      def default_headers
        ['result ID', 'First and Last name', 'User email', 'participant ID', 'started at', 'completed at']
      end

      def user_name(res)
        [res.user.first_name, res.user.last_name].reject(&:blank?).join(', ')
      end
    end
  end
end

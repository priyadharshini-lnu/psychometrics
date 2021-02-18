# frozen_string_literal: true

module Assessments
  module Export
    class RawFactorScores < BaseCommand
      private_attr_reader :assessment, :campaign

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      # rubocop:disable Metrics/BlockLength
      def call
        result = Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'AssessmentRawFactorScores') do |sheet|
            ## header
            header = {
              header: ['Result ID', 'Name', 'Email', 'Started At', 'Completed At', 'Status']
            }
            factors = assessment.dimension.all_factors.active.includes(:sub_factors).index_by(&:id)
            factor_ids = {}
            raw_scores = {}

            # Builds header and creates hash of Factor IDs
            #
            factors.each do |factor_id, factor|
              header[:header] << factor.name
              raw_scores[factor_id] = nil
              factor_ids[factor_id] = factor.sub_factor_ids
            end

            # Draws headers
            #
            sheet.add_row header[:header].flatten

            # Draws results
            #
            UsersResult.joins(:user_assessment).
              where(assessment_id: assessment.id, user_assessments: { campaign_id: campaign.id }).
              includes(:evaluator).find_each(batch_size: 100) do |res|
              raw_scores.each_key do |factor_id|
                raw_scores[factor_id] = res.scoring&.dig(factor_id.to_s, 'score')
              end

              sheet.add_row [res.encoded_id,
                             user_name(res),
                             res.user.email,
                             res.created_at.try(:strftime, '%D %r'),
                             res.completed_at.try(:strftime, '%D %r'),
                             I18n.t("activerecord.attributes.users_result.statuses.#{res.status}"),
                             *raw_scores.values]
            end
          end
        end
        broadcast :ok, result
      end
      # rubocop:enable Metrics/BlockLength

      def user_name(res)
        [res.user.first_name, res.user.last_name].reject(&:blank?).join(', ')
      end
    end
  end
end

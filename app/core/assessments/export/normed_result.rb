# frozen_string_literal: true

module Assessments
  module Export
    class NormedResult < BaseCommand
      private_attr_reader :assessment, :campaign

      def initialize(assessment, campaign)
        @assessment = assessment
        @campaign = campaign
      end

      # rubocop:disable Metrics/BlockLength, Metrics/AbcSize
      def call
        package = ExcelSafe.new

        package.add_worksheet('AssessmentNormedResults') do |sheet|
          ## header
          header = {
            header: [
              'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email',
              'Relationship', 'Started At', 'Completed At', 'Norm', 'Status'
            ]
          }
          factors = assessment.dimension.all_factors.active.includes(:sub_factors).index_by(&:id)
          factor_ids = {}
          normed_results = {}

          # Builds header and creates hash of Factor IDs
          #
          factors.each do |factor_id, factor|
            header[:header] << factor.name
            normed_results[factor_id] = nil
            factor_ids[factor_id] = factor.sub_factor_ids
          end

          # Draws headers
          #
          sheet.add_row header[:header].flatten

          # Draws results
          #
          UsersResult.joins(:user_assessment).
            where(user_assessments: { assessment_id: assessment.id, campaign_id: campaign.id }).
            includes(:norm, :subject, :evaluator, user_assessment: %i[relationship]).
            find_each(batch_size: 100) do |res|
            normed_results.each_key do |factor_id|
              normed_results[factor_id] = res.scoring&.dig(factor_id.to_s, 'norm_score')
            end

            sheet.add_row [
              res.encoded_id,
              user_name(res.subject.first_name, res.subject.last_name),
              res.subject.email,
              user_name(res.evaluator.first_name, res.evaluator.last_name),
              res.evaluator.email,
              res.user_assessment.relationship.name,
              res.created_at.try(:strftime, '%D %r'),
              res.completed_at.try(:strftime, '%D %r'),
              res.norm ? res.norm.name : '',
              I18n.t("activerecord.attributes.users_result.statuses.#{res.real_status}"),
              *normed_results.values
            ]
          end
        end
        broadcast :ok, package
      end
      # rubocop:enable Metrics/BlockLength, Metrics/AbcSize

      def user_name(first_name, last_name)
        [first_name, last_name].compact_blank.join(', ')
      end
    end
  end
end

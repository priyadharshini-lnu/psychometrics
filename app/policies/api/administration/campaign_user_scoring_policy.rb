# frozen_string_literal: true

module Api
  module Administration
    class CampaignUserScoringPolicy < ::Api::Administration::BasePolicy
      def index?
        has_permission?(:results, :scores)
      end

      def change_finalized_campaign_score?
        has_permission?(:results, :finalize_scores)
      end

      def rescore?
        has_permission?(:results, :rescore_responses)
      end

      def change_finalized_campaign_score_bulk?
        has_permission?(:results, :finalize_scores)
      end

      def rescore_bulk?
        has_permission?(:results, :rescore_responses)
      end

      def export_scorings?
        has_permission?(:results, :scores)
      end

      def import_external_campaign_scorings?
        has_permission?(:results, :external_score_import)
      end

      def import_external_scorings_sample_file?
        has_permission?(:results, :external_score_import)
      end

      class Scope < ::Api::Administration::BasePolicy::Scope
        def resolve
          if @user.has_permission?(:results, :scores)
            scope.includes(:user, :campaign_factor_values).where(campaign_id: campaign_id)
          else
            scope.none
          end
        end
      end
    end
  end
end

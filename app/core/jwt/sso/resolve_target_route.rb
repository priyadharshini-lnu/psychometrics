# frozen_string_literal: true

module Jwt
  module Sso
    class ResolveTargetRoute < BaseCommand
      include Rails.application.routes.url_helpers

      TARGET_REPLAY_STATUS = {
        'cmp' => 'campaign_pending',
        'asmt' => 'assessment_pending'
      }.freeze

      private_attr_reader :target_type, :campaign_id, :assessment_id, :participant

      def initialize(target_type:, campaign_id:, assessment_id:, participant:)
        @target_type = target_type
        @campaign_id = campaign_id
        @assessment_id = assessment_id
        @participant = participant
      end

      def call
        return broadcast(:ok, nil) if target_type.blank?

        campaign = Campaign.visible_to_end_user.find_by(id: campaign_id, project_id: participant.project_id)
        return broadcast(:error, :campaign_not_found) unless campaign

        campaign_user = CampaignUser.find_by(campaign_id: campaign.id, user_id: participant.id, active: true)
        return broadcast(:error, :campaign_not_eligible) unless campaign_user

        return broadcast(:ok, cmp_result(campaign)) if target_type == 'cmp'
        return resolve_assessment_route(campaign) if target_type == 'asmt'

        broadcast(:error, :invalid_target)
      end

      private

      def cmp_result(campaign)
        {
          target_type: target_type,
          campaign_id: campaign.id,
          replay_status: TARGET_REPLAY_STATUS[target_type]
        }
      end

      def resolve_assessment_route(campaign)
        user_assessment = UserAssessment.find_by(
          id: assessment_id,
          campaign_id: campaign.id,
          evaluator_id: participant.id
        )
        return broadcast(:error, :assessment_not_found) unless user_assessment

        broadcast(:ok, {
          target_type: target_type,
          campaign_id: campaign.id,
          user_assessment_id: user_assessment.id,
          replay_status: TARGET_REPLAY_STATUS[target_type]
        })
      end
    end
  end
end

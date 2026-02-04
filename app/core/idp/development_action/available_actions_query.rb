# frozen_string_literal: true

module Idp
  module DevelopmentAction
    class AvailableActionsQuery < Rectify::Query
      private_attr_reader :skill, :user_idp_plan

      def initialize(skill, user_idp_plan)
        @skill = skill
        @user_idp_plan = user_idp_plan
      end

      def query
        development_actions = skill.development_actions

        return development_actions unless skill.behavioral?

        level = campaign_user_level
        return development_actions if level.blank?

        development_actions.tagged_with([level], any: true, case_insensitive: true)
      end

      private

      def campaign_user_level
        @campaign_user_level ||= campaign_user&.level
      end

      def campaign_user
        @campaign_user ||= user_idp_plan.campaign.campaign_users.find_by(user_id: user_idp_plan.user_id)
      end
    end
  end
end

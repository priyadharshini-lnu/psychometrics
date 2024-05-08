# frozen_string_literal: true

module Idp
  module DevelopmentAction
    class SkillsByCategory < BaseCommand
      def initialize(user_idp_development_actions)
        @user_idp_development_actions = user_idp_development_actions
      end

      def call
        default_counts = Skill.categories.keys.to_h { |category| [category.to_sym, 0] }

        user_idp_development_actions.each_with_object(default_counts) do |user_idp_development_action, counts|
          skill = user_idp_development_action.skill
          counts[skill.category.to_sym] += 1 if skill
        end
      end

      private

      attr_reader :user_idp_development_actions
    end
  end
end

# frozen_string_literal: true

module Idp
  module DevelopmentAction
    class SkillsProgressByCategory < BaseCommand
      def initialize(user_idp_development_actions)
        @user_idp_development_actions = user_idp_development_actions
      end

      def call
        default_progress = Skill.categories.keys.to_h { |category| [category.to_sym, 0.0] }

        user_idp_development_actions.
          includes(:user_idp_skill, :skill).
          group('skills.category').
          average('COALESCE(progress, 0.0)').
          each_with_object(default_progress) do |(category, progress), result|
            result[category.to_sym] = progress.to_f.round(2)
          end
      end

      private

      attr_reader :user_idp_development_actions
    end
  end
end

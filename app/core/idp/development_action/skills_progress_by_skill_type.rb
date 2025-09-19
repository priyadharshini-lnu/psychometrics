# frozen_string_literal: true

module Idp
  module DevelopmentAction
    class SkillsProgressBySkillType < BaseCommand
      def initialize(user_idp_development_actions)
        @user_idp_development_actions = user_idp_development_actions
      end

      def call
        default_progress = ::Skill.skill_types.keys.to_h { |skill_type| [skill_type.to_sym, 0.0] }

        user_idp_development_actions.
          includes(:user_idp_skill, :skill).
          group('skills.skill_type').
          average('COALESCE(progress, 0.0)').
          each_with_object(default_progress) do |(skill_type, progress), result|
            result[skill_type.to_sym] = progress.to_f.round(2)
          end
      end

      private

      attr_reader :user_idp_development_actions
    end
  end
end

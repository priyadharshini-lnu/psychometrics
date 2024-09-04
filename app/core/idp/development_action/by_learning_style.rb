# frozen_string_literal: true

module Idp
  module DevelopmentAction
    class ByLearningStyle < BaseCommand
      def initialize(user_idp_development_actions)
        @user_idp_development_actions = user_idp_development_actions
      end

      def call
        default_counts = ::DevelopmentAction.learning_styles.keys.to_h { |category| [category.to_sym, 0] }

        user_idp_development_actions.each_with_object(default_counts) do |user_idp_development_action, counts|
          development_action = user_idp_development_action.development_action
          counts[development_action.learning_style.to_sym] += 1 if development_action
        end
      end

      private

      attr_reader :user_idp_development_actions
    end
  end
end

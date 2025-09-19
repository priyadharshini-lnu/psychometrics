# frozen_string_literal: true

module Api
  module V2
    module UserIdpDevelopmentAction
      class BulkUpdateContract < Api::Base::Contract
        config.messages.namespace = :user_idp_development_actions

        schema Api::V2::UserIdpDevelopmentAction::Schema.bulk_update

        rule(data: { attributes: :user_idp_development_actions }) do
          value.each_with_index do |action_data, index|
            validate_learning_style_for_action(action_data, index) if action_data[:learning_style].present?
          end
        end

        private

        def validate_learning_style_for_action(action_data, index)
          learning_style = action_data[:learning_style]

          if learning_style.blank?
            key([:data, :attributes, :user_idp_development_actions, index, :learning_style]).failure(
              I18n.t('administration.idp.development_actions.errors.learning_style_blank')
            )
            return
          end

          unless ::DevelopmentAction.learning_styles.key?(learning_style.to_s)
            key([:data, :attributes, :user_idp_development_actions, index, :learning_style]).failure(
              I18n.t('administration.idp.development_actions.errors.invalid_learning_style',
                     learning_style: learning_style,
                     valid_styles: ::DevelopmentAction.learning_styles.keys.join(', '))
            )
          end
        end
      end
    end
  end
end

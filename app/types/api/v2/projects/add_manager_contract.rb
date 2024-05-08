# frozen_string_literal: true

module Api
  module V2
    module Projects
      class AddManagerContract < Api::Base::Contract
        config.messages.namespace = :add_manager

        schema do
          required(:id).filled(:string)
          required(:manager_id).filled(:string)
          required(:user_id).filled(:string)
        end

        rule(:manager_id) do
          manager = ::User.find_by(id: value, project_id: values[:id])

          key.failure(:manager_not_found) if manager.blank?
        end

        rule(:user_id) do
          user = ::User.find_by(id: value, project_id: values[:id])

          key.failure(:user_not_found) if user.blank?
        end
      end
    end
  end
end

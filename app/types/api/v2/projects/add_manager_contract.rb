# frozen_string_literal: true

module Api
  module V2
    module Projects
      class AddManagerContract < Api::Base::Contract
        config.messages.namespace = :add_manager

        schema do
          required(:id).filled(:string)
          optional(:manager_id).maybe(:string)
          required(:user_id).filled(:string)
        end

        rule(:manager_id) do
          next if value.nil?

          manager = ::User.find_by(id: value, project_id: values[:id])
          key.failure(:manager_not_found) if manager.blank?
        end

        rule(:user_id) do
          user = ::User.find_by(id: value, project_id: values[:id])
          key.failure(:user_not_found) if user.blank?
        end

        rule(:manager_id, :user_id) do
          next if values[:manager_id].nil?

          key(:manager_id).failure(:cannot_be_self) if values[:manager_id] == values[:user_id]
        end
      end
    end
  end
end

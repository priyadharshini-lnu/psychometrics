# frozen_string_literal: true

module Api
  module V2
    module User
      class ResetPasswordContract < Api::Base::Contract
        config.messages.namespace = :reset_password

        schema Api::V2::User::Schema.reset_password_request

        rule(data: { attributes: :password }) do
          automatically_generate_password = values.dig(:data, :attributes, :automatically_generate_password)

          key.failure(:filled?) if !automatically_generate_password && value.blank?
        end

        rule(data: { attributes: :password }) do
          automatically_generate_password = values.dig(:data, :attributes, :automatically_generate_password)
          next if automatically_generate_password

          user = _context[:user]
          user.password = value

          next if user.valid?

          key.failure(user.errors['password'].first)
        end
      end
    end
  end
end

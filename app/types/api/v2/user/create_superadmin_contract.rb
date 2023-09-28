# frozen_string_literal: true

module Api
  module V2
    module User
      class CreateSuperadminContract < Api::Base::Contract
        config.messages.namespace = :create_superadmin
        schema Api::V2::User::Schema.create_request

        rule(data: { attributes: :email }).validate(email_format: { allow_blank: false })
        rule(data: { attributes: :email }) do
          key.failure(:uniq_email) if ::User.exists?(email: value, project_id: nil)
        end
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    module User
      class CreateGlobalAssessorContract < Api::Base::Contract
        config.messages.namespace = :create_global_assessor
        schema Api::V2::User::Schema.create_request

        rule(data: { attributes: :email }).validate(email_format: { allow_blank: false })
      end
    end
  end
end

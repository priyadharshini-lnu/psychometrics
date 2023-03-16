# frozen_string_literal: true

module Api
  module V2
    module Membership
      class CreateContract < Api::Base::Contract
        schema Api::V2::Membership::Schema.create_request

        rule(data: { attributes: :email }).validate(email_format: { allow_blank: true })
      end
    end
  end
end

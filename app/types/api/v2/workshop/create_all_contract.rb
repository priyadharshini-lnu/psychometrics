# frozen_string_literal: true

module Api
  module V2
    module Workshop
      class CreateAllContract < Api::Base::Contract
        config.messages.namespace = :create_all

        schema Api::V2::Workshop::Schema.create_all_request
      end
    end
  end
end

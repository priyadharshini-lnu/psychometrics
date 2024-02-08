# frozen_string_literal: true

module Api
  module V2
    module Workshop
      class CreateAllContract < Api::Base::Contract
        config.messages.namespace = :workshops

        # TODO: implement this rules with exact error keys
        # rule(data: { attributes: :workshops }) do
        #   index = 0
        #   assessor_id = 1

        #   key([:data, :attributes, :workshops, index, :assessor_ids]).failure(
        #     :no_available_assessor_slots,
        #     assessor: assessor_id
        #   )
        # end

        # rule(data: { attributes: :workshops }) do
        #   index = 0
        #   manager_id = 1

        #   key([:data, :attributes, :workshops, index, :manager_ids]).failure(
        #     :no_available_manager_slots,
        #     manager: manager_id
        #   )
        # end

        schema Api::V2::Workshop::Schema.create_all_request
      end
    end
  end
end

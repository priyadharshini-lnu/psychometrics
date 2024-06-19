# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class CopyContract < Api::Base::Contract
        schema do
          required(:data).hash do
            required(:attributes).hash do
              required(:name).filled(:string)
            end
          end
        end
        rule(data: { attributes: :name }) do
          next if value

          key.failure(:filled?)
        end
      end
    end
  end
end

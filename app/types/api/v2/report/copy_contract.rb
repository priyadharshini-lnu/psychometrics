# frozen_string_literal: true

module Api
  module V2
    module Report
      class CopyContract < Api::Base::Contract
        schema do
          required(:data).hash do
            required(:attributes).hash do
              required(:name).filled(:string)
            end
          end
        end
        rule(data: { attributes: :name }) do
          key.failure(:filled?) if value.strip.blank?
        end
      end
    end
  end
end

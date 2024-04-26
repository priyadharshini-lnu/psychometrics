# frozen_string_literal: true

module Api
  module V2
    module License
      class Contract < Api::Base::Contract
        rule(data: { relationships: { report_family: { data: :id } } }) do
          if value == 'common' && values.dig(:data, :relationships, :report_family, :data, :id).blank?
            key.failure(:filled?)
          end
        end
      end
    end
  end
end

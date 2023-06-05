# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class CommonContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = ::Assessment::COMMON_CATEGORIES_TYPES
          key.failure(:included_in?, list: list) unless list.include?(value)
        end
      end
    end
  end
end

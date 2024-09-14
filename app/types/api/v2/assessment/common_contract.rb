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

        rule(data: { relationships: :linked_assessment }) do
          next unless value

          next if value[:data].nil?

          assessment = ::Assessment.find(value[:data][:id])

          if assessment.linked_assessor_form && assessment.linked_assessor_form.id != _context[:params][:id].to_i
            key.failure(:already_assigned?, linked_assessor_form_name: assessment.linked_assessor_form.name)
          end
        end
      end
    end
  end
end

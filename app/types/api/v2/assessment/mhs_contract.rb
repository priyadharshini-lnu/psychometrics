# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class MhsContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = [::Assessment::MHS]
          key.failure(:included_in?, list: list) unless list.include?(value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next key.failure(:filled?) unless value

          unless Settings.providers.mhs.assessments.find { |a| a[:id].downcase == value }
            key.failure(:not_in_the_list?)
          end
        end
      end
    end
  end
end

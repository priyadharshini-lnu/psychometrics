# frozen_string_literal: true

module Api
  module V2
    module Assessment
      class HoganContract < Api::Base::Contract
        rule(data: { attributes: :category }) do
          next unless value

          list = [::Assessment::HOGAN]
          key.failure(:included_in?, list: list) unless list.include?(value)
        end

        rule(data: { attributes: { external_settings: :assessment_id } }) do
          next key.failure(:filled?) unless value

          key.failure(:not_in_the_list?) unless Settings.providers.hogan.assessments.map(&:id).include?(value)
        end
      end
    end
  end
end

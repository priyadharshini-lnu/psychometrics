# frozen_string_literal: true

module Api
  module V2
    module CampaignScoringVariable
      class Contract < Api::Base::Contract
        schema Api::V2::CampaignScoringVariable::Schema.update_request

        rule(data: { attributes: :variables }) do
          rows = value.split("\n")

          rows.each.with_index do |row, i|
            key.failure(:invalid_value, row: i + 1, value: row) unless row.match?(::RegexConstants::LUA_GLOBLA_VAR)
          end
        end

        rule(data: { attributes: :variables }) do
          rows = value.split("\n").reverse

          rows.each.with_index do |row, i|
            row =~ /^([A-Za-z_][A-za-z0-9_]*)\s/
            name = Regexp.last_match(1)
            if value.scan(/#{name}\s/).count > 1
              key.failure(:not_uniq_variable, row: i + 1, value: name)
            end
          end
        end
      end
    end
  end
end

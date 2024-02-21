# frozen_string_literal: true

module Api
  module V2
    module CampaignScoringVariable
      class Contract < Api::Base::Contract
        schema Api::V2::CampaignScoringVariable::Schema.update_request

        rule(data: { attributes: :variables }) do
          rows = (value || '').split("\n")

          rows.each.with_index do |row, i|
            key.failure(:invalid_value, row: i + 1, value: row) unless row.match?(::RegexConstants::LUA_GLOBLA_VAR)
          end
        end

        rule(data: { attributes: :variables }) do
          rows = (value || '').split("\n").reverse
          variable_names = rows.map { |row| row.match(/^[a-zA-Z][a-zA-Z0-9_]*/).to_s }
          variable_names.each.with_index do |name, i|
            if variable_names[i + 1..].include?(name)
              key.failure(:not_uniq_variable, row: rows.size - i, value: name)
            end
          end
        end
      end
    end
  end
end

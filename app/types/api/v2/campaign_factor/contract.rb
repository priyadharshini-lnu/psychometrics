# frozen_string_literal: true

module Api
  module V2
    module CampaignFactor
      class Contract < Api::Base::Contract
        schema Api::V2::CampaignFactor::Schema.create_request
        rule(data: { attributes: :code }) do
          same_code_factors = ::CampaignFactor.where(campaign_id: _context[:params][:campaign_id], code: value)
          same_code_factors = same_code_factors.where.not(id: _context[:params][:id]) if _context[:params][:id]
          if same_code_factors.exists?
            key.failure(:uniq?)
          end
          unless value.match?(::RegexConstants::LUA_VARIABLE)
            key.failure(:invalid_lua_name)
          end
        end

        rule(data: { attributes: :name }) do
          key.failure(:size?, size: 64) if value.length > 64
          same_name_factors = ::CampaignFactor.where(campaign_id: _context[:params][:campaign_id], name: value)
          same_name_factors = same_name_factors.where.not(id: _context[:params][:id]) if _context[:params][:id]
          if same_name_factors.exists?
            key.failure(:uniq?)
          end
          unless value.match?(::RegexConstants::SHEET_COLUMN_REGEX)
            key.failure(:match_regexp?)
          end
        end

        rule(data: { attributes: :assessment_id }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :factor_type) == 'assessment' && value.blank?
        end

        rule(data: { attributes: :assessment_score_type }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :factor_type) == 'assessment' && value.blank?
        end

        rule(data: { attributes: :factor_id }) do
          if %w[assessment assessor_scoring].include?(values.dig(:data, :attributes, :factor_type)) && value.blank?
            key.failure(:filled?)
          end
        end
      end
    end
  end
end

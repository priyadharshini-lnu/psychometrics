# frozen_string_literal: true

module Api
  module V2
    module FactorsNorm
      class UpdateContract < Api::Base::Contract
        schema Api::V2::FactorsNorm::Schema.update_request

        rule(data: { attributes: :field_value }) do
          unless value.blank? || value.to_s.valid_float?
            key.failure(I18n.t('dry_errors.errors.factors_norms.invalid_float'))
          end
        end

        rule(data: { attributes: :level }) do
          unless ::FactorsNorm::LEVELS.include?(value)
            key(:level).failure(
              I18n.t('dry_errors.errors.factors_norms.invalid_level', levels: ::FactorsNorm::LEVELS.join(', '))
            )
          end
        end

        rule(data: { attributes: :field_name }) do
          unless %w[score_from score_to].include?(value)
            key(:field_name).failure(I18n.t('dry_errors.errors.factors_norms.invalid_field_name'))
          end
        end

        rule(data: { attributes: :field_value }) do
          next if value.blank?

          field_name = _context[:params][:data][:attributes][:field_name]
          field_value = value.to_f

          factors_norm = ::FactorsNorm.find_by(
            factor_id: _context[:params][:data][:attributes][:factor_id],
            norm_id: _context[:params][:data][:attributes][:norm_id]
          ) || ::FactorsNorm.new(props: [])

          level = _context[:params][:data][:attributes][:level]
          if field_name == 'score_from'
            score_to = factors_norm.props.detect { |item| item['level'] == level }&.dig('score_to')
            if score_to.present? && field_value.to_f >= score_to.to_f
              key(:field_value).failure(I18n.t('dry_errors.errors.factors_norms.score_from_less_than_score_to'))
            end
          elsif field_name == 'score_to'
            score_from = factors_norm.props.detect { |item| item['level'] == level }&.dig('score_from')
            if score_from.present? && field_value <= score_from.to_f
              key(:field_value).failure(I18n.t('dry_errors.errors.factors_norms.score_to_greater_than_score_from'))
            end
          end
        end
      end
    end
  end
end

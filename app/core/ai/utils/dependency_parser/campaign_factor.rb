# frozen_string_literal: true

module AI
  module Utils
    module DependencyParser
      class CampaignFactor < Base
        def parse
          ensure_dependency_configured!(
            dependency: 'Campaign Factors',
            condition: dependency_campaign_factor.present?,
            error_message: I18n.t(
              'administration.ai_assistants.artifacts.parsers.campaign_factor.no_campaign_factors_configured'
            )
          )

          factor_data = collect_factor_data(dependency_campaign_factor)

          raise_errors_if_any('Campaign Factors')

          format_campaign_factors_output(factor_data)
        end

        private

        def collect_factor_data(campaign_factors)
          factor_data = []

          campaign_factors.each do |factor|
            value = factor.campaign_factor_values.find_by(user_id: user.id)

            if value.blank?
              add_error(
                I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_no_value',
                       code: factor.code, name: factor.name, email: user.email)
              )
              next
            end

            # Extract the actual value based on output type
            actual_value = extract_factor_value(factor, value)

            if actual_value.blank?
              add_error(I18n.t('administration.ai_assistants.artifacts.parsers.campaign_factor.factor_empty_value',
                               code: factor.code, name: factor.name, email: user.email))
              next
            end

            factor_data << {
              factor: factor,
              value: value,
              actual_value: actual_value
            }
          end

          factor_data
        end

        def extract_factor_value(factor, value)
          case factor.output_type
            when 'numeric'
              value.numeric_value
            when 'string'
              value.string_value
          end
        end

        def format_campaign_factors_output(factor_data)
          if factor_data.empty?
            return "<campaign_factors>#{I18n.t(
              'administration.ai_assistants.artifacts.parsers.campaign_factor.no_valid_factor_data'
            )}</campaign_factors>"
          end

          content = factor_data.map do |data|
            parse_campaign_factor(data[:factor], data[:value], data[:actual_value])
          end.join("\n")

          "<campaign_factors>\n#{content}\n</campaign_factors>"
        end

        def parse_campaign_factor(factor, _value, actual_value)
          value_str = actual_value.presence || 'N/A'

          <<~FACTOR.strip
            <campaign_factor>
              <name>#{factor.name}</name>
              <code>#{factor.code}</code>
              <description>#{factor.description}</description>
              <output_type>#{factor.output_type}</output_type>
              <value>#{value_str}</value>
            </campaign_factor>
          FACTOR
        end

        def dependency_campaign_factor
          @dependency_campaign_factor ||= campaign_assistant_artifact.campaign_factors.includes(:campaign_factor_values)
        end
      end
    end
  end
end

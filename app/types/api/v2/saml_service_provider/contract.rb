# frozen_string_literal: true

module Api
  module V2
    module SamlServiceProvider
      class Contract < Api::Base::Contract
        config.messages.namespace = :saml_service_provider

        rule(data: { attributes: :name }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :entity_id }) do
          key.failure(:filled?) if key? && value.blank?
        end

        rule(data: { attributes: :acs_urls }) do
          key.failure(:filled?) if key? && value.blank?
          key.failure(:must_be_array) unless value.is_a?(Array)
          key.failure(:must_not_be_empty) if value.is_a?(Array) && value.empty?

          if value.is_a?(Array)
            value.each do |url|
              unless url.match?(URI::DEFAULT_PARSER.make_regexp(%w[http https]))
                key.failure(:invalid_url, url: url)
                break
              end
            end
          end
        end
      end
    end
  end
end

# frozen_string_literal: true

module Api
  module V2
    module CommunicationCenter
      # Shared by CommunicationTemplate and CommunicationDelivery's update_translation actions --
      # both have an identical { subject, body, locale } request shape.
      class UpdateTranslationContract < Api::Base::Contract
        config.messages.namespace = :communication_center

        rule(:data) do
          locale = values.dig(:data, :attributes, :locale)
          key.failure(:invalid_locale) unless I18n.available_locales.map(&:to_s).include?(locale.to_s)
        end
      end
    end
  end
end

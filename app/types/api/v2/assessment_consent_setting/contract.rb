# frozen_string_literal: true

module Api
  module V2
    module AssessmentConsentSetting
      class Contract < Api::Base::Contract
        config.messages.namespace = :assessment_consent_settings

        rule(data: :attributes) do
          data_role = values.dig(:data, :attributes, :data_role)
          custom_consent_texts = values.dig(:data, :attributes, :custom_consent_texts)

          if data_role == 'controller'
            has_consent_text = custom_consent_texts&.any? { |text| text[:text].present? }
            unless has_consent_text
              key(%i[data attributes custom_consent_texts]).failure(I18n.t('shared.custom_consent_text_required'))
            end
          end
        end
      end
    end
  end
end

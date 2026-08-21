# frozen_string_literal: true

module Api
  module V2
    module PrivacySettings
      class UpdateContract < Api::Base::Contract
        schema Api::V2::PrivacySettings::Schema.update_request

        rule(data: { attributes: :privacy_link_text }) do
          next unless values.dig(:data, :attributes, :enable_privacy_link)

          privacy_link_texts = values.dig(:data, :attributes, :privacy_link_texts)
          # If privacy_link_texts is being submitted, skip the plain text validation
          # (the privacy_link_texts rule will handle it)
          next if privacy_link_texts.present?

          key.failure(:filled?) if value.blank?
        end

        rule(data: { attributes: :privacy_link_texts }) do
          next unless values.dig(:data, :attributes, :enable_privacy_link)
          next if value.blank? # Only validate if privacy_link_texts is being submitted

          has_any_text = value.any? { |entry| entry[:text].present? }
          key.failure(:filled?) unless has_any_text
        end

        rule(data: { attributes: :privacy_link_url }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :enable_privacy_link) && value.blank?
        end

        rule(data: { attributes: :privacy_link_url }).validate(http_url_format: { allow_blank: true })

        rule(data: { attributes: :enable_video_call_recording_for_all_new_campaigns }) do
          key.failure(:filled?) if values.dig(:data, :attributes, :allow_video_call_recording) && value.nil?
        end

        rule(data: { attributes: :video_call_recording_expiry_in_seconds }) do
          if values.dig(:data, :attributes, :allow_video_call_recording)
            if value.blank?
              key.failure(:filled?)
            elsif value.to_i < 1440
              key.failure(I18n.t('administration.projects.privacy_settings.errors.min_retention'))
            end
          end
        end

        rule(data: { attributes: :allow_video_call_recording }) do
          next unless value == false

          privacy_setting_id = values.dig(:data, :id)
          next unless privacy_setting_id

          privacy_setting = ::PrivacySetting.find_by(id: privacy_setting_id)
          next unless privacy_setting&.project_id

          if campaigns_with_recording_enabled?(privacy_setting.project_id)
            key.failure(
              I18n.t('administration.projects.privacy_settings.errors.cannot_disable_while_campaign_enabled')
            )
          end
        end

        private

        def campaigns_with_recording_enabled?(project_id)
          ::Campaign.joins(:campaign_options).
            exists?(project_id: project_id,
                    campaign_options: { enable_video_call_recording: true })
        end
      end
    end
  end
end

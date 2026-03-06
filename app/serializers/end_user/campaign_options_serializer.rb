# frozen_string_literal: true

module EndUser
  class CampaignOptionsSerializer < Panko::Serializer
    attributes :fixed_time, :time_zone, :fixed_time_duration, :instructions_enabled, :instructions,
               :proctoring_enabled, :identification, :rules, :integration_type,
               :workshop_booking_requires_prework_completion, :show_watermark, :watermark_content,
               :proctoring_enabled_on_workshop_activity, :enable_mobile_proctoring

    def proctoring_enabled
      Settings.features.proctoring && object.proctoring_enabled
    end

    def proctoring_enabled_on_workshop_activity
      return false unless proctoring_enabled

      object.proctoring_enabled_on_workshop_activity
    end

    def enable_mobile_proctoring
      return false unless proctoring_enabled

      object.enable_mobile_proctoring
    end

    def watermark_content
      return unless object.show_watermark
      return current_user.email if object.watermark_content.blank?

      Mustache.render(object.watermark_content, current_user.slice(:id, :first_name, :last_name, :email))
    end

    private

    def current_user
      context[:current_user]
    end
  end
end

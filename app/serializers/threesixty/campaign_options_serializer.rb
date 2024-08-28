# frozen_string_literal: true

module Threesixty
  class CampaignOptionsSerializer < Panko::Serializer
    attributes :participants, :reports, :messages

    def reports
      object&.reports
    end

    def messages
      object&.messages
    end

    def participants
      watermark_content = object.participants.dig('global', 'watermark_content')
      show_watermark = object.participants.dig('global', 'show_watermark')

      return object.participants unless show_watermark

      watermark =
        if watermark_content.present?
          Mustache.render(
            watermark_content, current_user.slice(:id, :first_name, :last_name, :email)
          )
        else
          current_user.email
        end

      object.participants['global']['watermark_content'] = watermark
      object.participants
    end

    private

    def current_user
      context[:current_user]
    end
  end
end

# frozen_string_literal: true

class CampaignDecorator < BaseDecorator
  def type
    I18n.t("activerecord.attributes.threesixty_campaign.types.#{object.type}")
  end
end

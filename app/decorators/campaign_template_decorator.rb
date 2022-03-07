# frozen_string_literal: true

class CampaignTemplateDecorator < BaseDecorator
  def delete_confirmation
    {
      title: I18n.t("administration.#{i18n}.resource.confirmations.delete.title", name: html_escaped_display_name),
      body: I18n.t("administration.#{i18n}.resource.confirmations.delete.body")
    }.to_json
  end
end

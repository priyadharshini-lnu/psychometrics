# frozen_string_literal: true

class AddDefaultLanguageAndAvailableLanguagesToCampaignReports < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_reports, :default_language, :string
    add_column :campaign_reports, :available_languages, :jsonb, default: []
  end
end

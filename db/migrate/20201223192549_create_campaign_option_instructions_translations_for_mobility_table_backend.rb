# frozen_string_literal: true

class CreateCampaignOptionInstructionsTranslationsForMobilityTableBackend < ActiveRecord::Migration[5.2]
  def change
    create_table :campaign_option_translations do |t|
      # Translated attribute(s)
      t.text :instructions

      t.string :locale, null: false
      t.references :campaign_option, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :campaign_option_translations, :locale,
              name: :index_campaign_option_translations_on_locale
    add_index :campaign_option_translations, %i[campaign_option_id locale],
              name: :index_dd1550fac3e20f3c72e929b92570e38fc03f70a8, unique: true
  end
end

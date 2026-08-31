# frozen_string_literal: true

class CreateCampaignNameTranslationsForMobilityTableBackend < ActiveRecord::Migration[8.0]
  def change
    create_table :campaign_translations do |t|
      t.string :name

      t.string :locale, null: false
      t.references :campaign, null: false, foreign_key: true, index: false
      t.bigint :tenant_id

      t.timestamps null: false
    end

    add_index :campaign_translations,
              :locale,
              name: :index_campaign_translations_on_locale
    add_index :campaign_translations,
              %i[campaign_id locale],
              name: :index_campaign_translations_on_campaign_id_and_locale,
              unique: true
    add_index :campaign_translations,
              :tenant_id,
              name: :index_campaign_translations_on_tenant_id
  end
end

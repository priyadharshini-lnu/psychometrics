# frozen_string_literal: true

class CreateCampaignAssessmentGroupNameTranslationsForMobilityTableBackend < ActiveRecord::Migration[8.0]
  def change
    create_table :campaign_assessment_group_translations do |t|
      t.string :name

      t.string :locale, null: false
      t.references :campaign_assessment_group, null: false, foreign_key: true, index: false
      t.bigint :tenant_id

      t.timestamps null: false
    end

    add_index :campaign_assessment_group_translations,
              :locale,
              name: :index_campaign_assessment_group_translations_on_locale
    add_index :campaign_assessment_group_translations,
              %i[campaign_assessment_group_id locale],
              name: :index_cag_t18n_on_campaign_assessment_group_id_and_locale,
              unique: true
    add_index :campaign_assessment_group_translations,
              :tenant_id,
              name: :index_campaign_assessment_group_translations_on_tenant_id
  end
end

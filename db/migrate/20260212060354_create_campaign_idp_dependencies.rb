# frozen_string_literal: true

class CreateCampaignIdpDependencies < ActiveRecord::Migration[8.0]
  def change
    create_table :campaign_idp_dependencies do |t|
      t.references :campaign_idp, foreign_key: true
      t.references :dependency, polymorphic: true

      t.timestamps
    end

    add_index :campaign_idp_dependencies,
              %i[campaign_idp_id dependency_type dependency_id],
              unique: true,
              name: 'index_unique_dependency_per_campaign_idp'
  end
end

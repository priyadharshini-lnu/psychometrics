# frozen_string_literal: true

class AddTagsToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    change_table :idp_templates, bulk: true do |t|
      t.jsonb :behavioural_global_tags, null: false, default: []
      t.jsonb :behavioural_client_tags, null: false, default: []
      t.jsonb :technical_global_tags, null: false, default: []
      t.jsonb :technical_client_tags, null: false, default: []
    end
  end
end

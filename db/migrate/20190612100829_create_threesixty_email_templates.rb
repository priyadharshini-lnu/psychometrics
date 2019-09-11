# frozen_string_literal: true

class CreateThreesixtyEmailTemplates < ActiveRecord::Migration[5.1]
  def change
    create_table :threesixty_email_templates do |t|
      t.belongs_to :threesixty_campaign, foreign_key: { on_delete: :restrict }, index: {
        name: :threesixty_email_template_cam_id
      }
      t.integer :category
      t.string :name, null: false
      t.string :from, null: false
      t.string :reply_to_email, null: false
      t.text :content
      t.text :subject
      t.boolean :schedulable, default: true
      t.jsonb :meta, default: {}

      t.timestamps
    end

    add_index :threesixty_email_templates, %i[threesixty_campaign_id name], unique: true,
      name: :index_threesixty_email_templates_campaign_name
  end
end

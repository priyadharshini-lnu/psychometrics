class CreatePrivacyLinks < ActiveRecord::Migration[5.1]
  def change
    create_table :privacy_links do |t|
      t.references :client, foreign_key: true
      t.string :text
      t.text :link

      t.timestamps
    end
  end
end

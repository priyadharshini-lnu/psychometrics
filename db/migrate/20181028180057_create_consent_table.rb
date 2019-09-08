# frozen_string_literal: true

class CreateConsentTable < ActiveRecord::Migration[5.1]
  def change
    create_table :privacy_consents do |t|
      t.references :membership, foreign_key: { on_delete: :cascade }

      t.timestamps
    end
  end
end

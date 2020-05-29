# frozen_string_literal: true

class CreateHighlightedQuestions < ActiveRecord::Migration[5.1]
  def change
    create_table :highlights, id: false do |t|
      t.uuid :id, primary_key: true
      t.belongs_to :assessment, foreign_key: { on_delete: :cascade }
      t.belongs_to :user, foreign_key: { on_delete: :cascade }
      t.jsonb :data, null: false, default: {}
      t.integer :resource_id, null: false
      t.string :resource_type, null: false
    end
  end
end

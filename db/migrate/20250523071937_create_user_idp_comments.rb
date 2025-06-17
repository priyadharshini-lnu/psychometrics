# frozen_string_literal: true

class CreateUserIdpComments < ActiveRecord::Migration[7.1]
  def change
    create_table :user_idp_comments do |t|
      t.text :content, null: false
      t.references :user_idp_plan, foreign_key: { on_delete: :cascade, to_table: :user_idp_plans }
      t.references :created_by, foreign_key: { to_table: :users, on_delete: :cascade }
      t.references :resource, polymorphic: true, null: true
      t.references :parent, foreign_key: { to_table: :user_idp_comments, on_delete: :cascade }, null: true
      t.references :resolved_by, foreign_key: { to_table: :users, on_delete: :nullify }, null: true
      t.datetime :resolved_at, null: true
      t.integer :read_by_user_ids, array: true, default: [], null: false
      t.integer :replies_count, default: 0, null: false
      t.boolean :edited, default: false, null: false

      t.timestamps
    end

    add_index :user_idp_comments, %i[user_idp_plan_id created_by_id]

    add_index :user_idp_comments, :read_by_user_ids, using: 'gin',
              name: 'index_user_idp_comments_on_read_by_user_ids'

    add_index :user_idp_comments, :created_at,
              name: 'index_user_idp_comments_on_created_at'
  end
end

# frozen_string_literal: true

class AddDeletedAtAndByToUserIdpDevelopnentActions < ActiveRecord::Migration[8.0]
  def change
    add_column :user_idp_development_actions, :deleted_at, :datetime
    add_reference :user_idp_development_actions, :deleted_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end

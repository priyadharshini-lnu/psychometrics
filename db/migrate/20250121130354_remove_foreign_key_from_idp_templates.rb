# frozen_string_literal: true

class RemoveForeignKeyFromIdpTemplates < ActiveRecord::Migration[7.1]
  def up
    remove_foreign_key :idp_templates, column: :owner_id
  end

  def down
    add_foreign_key :idp_templates, :owners, column: :owner_id
  end
end

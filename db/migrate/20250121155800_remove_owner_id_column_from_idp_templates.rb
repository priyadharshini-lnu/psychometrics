# frozen_string_literal: true

class RemoveOwnerIdColumnFromIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    remove_column :idp_templates, :owner_id, :bigint
  end
end

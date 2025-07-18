# frozen_string_literal: true

class AddPublishedToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :idp_templates, :status, :integer, default: 0
  end
end

# frozen_string_literal: true

class AddProjectToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_reference :idp_templates, :project, foreign_key: { to_table: :clients, on_delete: :cascade }
  end
end

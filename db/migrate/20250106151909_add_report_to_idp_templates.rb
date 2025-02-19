# frozen_string_literal: true

class AddReportToIdpTemplates < ActiveRecord::Migration[7.1]
  def change
    add_reference :idp_templates, :report, null: true, foreign_key: true
  end
end

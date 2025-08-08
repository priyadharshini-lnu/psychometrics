# frozen_string_literal: true

class AddIsTemplateToCampaigns < ActiveRecord::Migration[7.1]
  def change
    add_column :campaigns, :is_template, :boolean, default: false
  end
end

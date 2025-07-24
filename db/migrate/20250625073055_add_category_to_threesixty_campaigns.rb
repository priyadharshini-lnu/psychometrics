# frozen_string_literal: true

class AddCategoryToThreesixtyCampaigns < ActiveRecord::Migration[7.1]
  def change
    add_column :threesixty_campaigns, :category, :integer, default: 0
  end
end

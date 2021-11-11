# frozen_string_literal: true

class AddUniqCodeToCampaign < ActiveRecord::Migration[5.2]
  def change
    add_column :campaigns, :uniq_code, :string, uniq: true

    Campaign.find_each do |c|
      c.send(:set_uniq_code)
      c.save!
    end
  end
end

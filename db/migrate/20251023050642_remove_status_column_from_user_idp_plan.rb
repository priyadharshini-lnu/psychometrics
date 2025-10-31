# frozen_string_literal: true

class RemoveStatusColumnFromUserIdpPlan < ActiveRecord::Migration[7.1]
  def change
    remove_column :user_idp_plans, :status, :integer
  end
end

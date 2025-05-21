# frozen_string_literal: true

class AddEndDateToUserIdpPlans < ActiveRecord::Migration[7.1]
  def change
    add_column :user_idp_plans, :end_date, :date
  end
end

class ChangeTimeTypeInUserAvailabilityDay < ActiveRecord::Migration[7.0]
  def change
    change_column :user_availability_days, :start_time, :string
    change_column :user_availability_days, :end_time, :string
  end
end

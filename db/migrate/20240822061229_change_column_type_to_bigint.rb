# frozen_string_literal: true

class ChangeColumnTypeToBigint < ActiveRecord::Migration[7.1]
  def up
    rename_column :mettl_user_assessments, :schedule_id, :mettl_schedule_id
    change_column :mettl_user_assessments, :mettl_schedule_id, :bigint
  end

  def down
    change_column :mettl_user_assessments, :mettl_schedule_id, :integer
    rename_column :mettl_user_assessments, :mettl_schedule_id, :schedule_id
  end
end

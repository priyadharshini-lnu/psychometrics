class ChangeLicensesTypeNull < ActiveRecord::Migration[6.1]
  def change
    change_column_null :licenses, :report_family_id, true
  end
end

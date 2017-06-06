class AddConstraintToAssigns < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :assigns, :memberships
    add_foreign_key :assigns, :assessments
    change_column_null(:assigns, :membership_id, false)
    change_column_null(:assigns, :assessment_id, false)
  end
end

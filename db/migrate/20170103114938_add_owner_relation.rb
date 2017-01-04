class AddOwnerRelation < ActiveRecord::Migration[5.0]
  TABLES_ARR = %i(norms dimensions assessments reports questions communications libraries)

  def up
    TABLES_ARR.each do |table|
      add_column table, :owner_id, :integer, null: true, index: true
    end
  end

  def down
    TABLES_ARR.each do |table|
      remove_column table, :owner_id
    end
  end
end

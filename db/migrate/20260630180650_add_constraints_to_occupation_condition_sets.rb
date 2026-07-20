# frozen_string_literal: true

class AddConstraintsToOccupationConditionSets < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    add_index :occupation_condition_sets, :dimension_id, algorithm: :concurrently, if_not_exists: true
    add_index :occupation_condition_sets, %i[dimension_id name], unique: true, algorithm: :concurrently,
                                                                   if_not_exists: true
    add_index :occupation_condition_sets, :tenant_id, algorithm: :concurrently, if_not_exists: true
    add_index :dimensions, :default_occupation_condition_set_id, algorithm: :concurrently, if_not_exists: true
    add_index :occupations_factors, :occupation_condition_set_id, algorithm: :concurrently, if_not_exists: true
    add_index :campaign_assessments, :occupation_condition_set_id, algorithm: :concurrently, if_not_exists: true
    add_index :users_results, :occupation_condition_set_id, algorithm: :concurrently, if_not_exists: true

    change_table :occupation_condition_sets, bulk: true do |t|
      t.change_null :name, false
      t.change_null :dimension_id, false
    end
    change_column_null :occupations_factors, :occupation_condition_set_id, false
  end

  def down
    change_column_null :occupations_factors, :occupation_condition_set_id, true
    change_table :occupation_condition_sets, bulk: true do |t|
      t.change_null :dimension_id, true
      t.change_null :name, true
    end

    remove_index :users_results, :occupation_condition_set_id, if_exists: true
    remove_index :campaign_assessments, :occupation_condition_set_id, if_exists: true
    remove_index :occupations_factors, :occupation_condition_set_id, if_exists: true
    remove_index :dimensions, :default_occupation_condition_set_id, if_exists: true
    remove_index :occupation_condition_sets, :tenant_id, if_exists: true
    remove_index :occupation_condition_sets, %i[dimension_id name], if_exists: true
    remove_index :occupation_condition_sets, :dimension_id, if_exists: true
  end
end

# frozen_string_literal: true

class AddOccupationConditionSets < ActiveRecord::Migration[7.1]
  def change
    create_table :occupation_condition_sets do |t|
      t.string :name
      t.integer :dimension_id
      t.bigint :tenant_id
      t.timestamps
    end

    add_column :dimensions, :default_occupation_condition_set_id, :bigint
    add_column :occupations_factors, :occupation_condition_set_id, :bigint
    add_column :campaign_assessments, :occupation_condition_set_id, :bigint
    add_column :users_results, :occupation_condition_set_id, :bigint

    add_foreign_key :occupation_condition_sets, :dimensions, on_delete: :cascade
    add_foreign_key :occupation_condition_sets, :clients, column: :tenant_id
    add_foreign_key :dimensions, :occupation_condition_sets, column: :default_occupation_condition_set_id,
                     on_delete: :nullify
    add_foreign_key :occupations_factors, :occupation_condition_sets, on_delete: :cascade
    add_foreign_key :campaign_assessments, :occupation_condition_sets
    add_foreign_key :users_results, :occupation_condition_sets
  end
end

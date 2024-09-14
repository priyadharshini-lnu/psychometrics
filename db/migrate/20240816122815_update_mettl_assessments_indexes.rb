# frozen_string_literal: true

class UpdateMettlAssessmentsIndexes < ActiveRecord::Migration[7.1]
  def change
    remove_index :mettl_assessments, :product_id if index_exists?(:mettl_assessments, :product_id)
    add_index :mettl_assessments, %i[product_id project_id], unique: true
  end
end

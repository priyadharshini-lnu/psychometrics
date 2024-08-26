# frozen_string_literal: true

class AddUniqueIndexToProductIdInMettlAssessments < ActiveRecord::Migration[7.1]
  def change
    add_index :mettl_assessments, :product_id, unique: true
    remove_index :mettl_assessments, %i[product_id project_id] if index_exists?(:mettl_assessments,
                                                                                %i[product_id project_id])
  end
end

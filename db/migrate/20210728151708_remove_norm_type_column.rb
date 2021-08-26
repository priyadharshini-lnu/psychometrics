# frozen_string_literal: true

class RemoveNormTypeColumn < ActiveRecord::Migration[5.2]
  def change
    remove_column :campaign_assessments, :norm_type
    remove_column :user_assessments, :norm_type
    remove_column :reports, :type
  end
end

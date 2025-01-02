# frozen_string_literal: true

class AddTimeExtensionToSimulationUserAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :simulation_user_assessments, :time_extension, :float, default: 1.0
  end
end

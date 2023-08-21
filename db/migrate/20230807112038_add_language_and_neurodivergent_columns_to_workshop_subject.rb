# frozen_string_literal: true

class AddLanguageAndNeurodivergentColumnsToWorkshopSubject < ActiveRecord::Migration[7.0]
  def change
    add_column :workshop_subjects, :preferred_language, :string
    add_column :workshop_subjects, :neurodivergent, :boolean
    add_column :workshop_subjects, :neurodivergent_comments, :text
  end
end

# frozen_string_literal: true

class AddExternalScoring < ActiveRecord::Migration[5.2]
  def change
    add_column :factors, :external_scoring, :jsonb, default: []
  end
end

class AddAgileScoringToAssigns < ActiveRecord::Migration[5.0]
  def change
    add_column :assigns, :agile_scoring, :jsonb
  end
end

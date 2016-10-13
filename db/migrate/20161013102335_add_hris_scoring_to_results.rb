class AddHrisScoringToResults < ActiveRecord::Migration[5.0]
  def change
    add_column :results, :embedded_data, :json
    add_column :results, :scoring, :json
  end
end

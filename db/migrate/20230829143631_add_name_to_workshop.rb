# frozen_string_literal: true

class AddNameToWorkshop < ActiveRecord::Migration[7.0]
  def up
    add_column :workshops, :name, :string

    ActiveRecord::Migration[7.0].execute(%(
      UPDATE workshops SET name = to_char ( start_time at time zone 'utc' at time zone timezone, 'FMDDth FMMonth YYYY, FMHH:MI am' )
    ))
  end

  def down
    remove_column :workshops, :name
  end
end

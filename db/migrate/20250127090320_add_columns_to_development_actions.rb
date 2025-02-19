# frozen_string_literal: true

class AddColumnsToDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    add_reference :development_actions, :project, foreign_key: { to_table: :clients }, if_not_exists: true
    add_column :development_actions, :course_url, :string, if_not_exists: true
    add_column :development_actions, :course_start_date, :date, if_not_exists: true
    add_column :development_actions, :course_end_date, :date, if_not_exists: true
  end
end

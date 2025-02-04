# frozen_string_literal: true

class AddCourseStartDateAndCourseEndDateToDevelopmentActions < ActiveRecord::Migration[7.1]
  def change
    add_column :development_actions, :course_start_date, :datetime
    add_column :development_actions, :course_end_date, :datetime
  end
end

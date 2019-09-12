# frozen_string_literal: true

class AddDefaultColorsToAssReports < ActiveRecord::Migration[5.1]
  def change
    Report.find_each do |r|
      r.icon_color = Settings.default_colors.sample
      r.save
    end
    Assessment.find_each do |a|
      a.icon_color = Settings.default_colors.sample
      a.save
    end
  end
end

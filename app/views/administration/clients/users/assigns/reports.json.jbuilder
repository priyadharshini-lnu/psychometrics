# frozen_string_literal: true

json.array!(resources) do |resource|
  selected = @selected_reports.include?(resource) if @selected_reports
  json.name resource.name
  json.id resource.id
  json.selected selected
  json.disabled selected
  json.multiple resource.multiple?
end

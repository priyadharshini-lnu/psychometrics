# frozen_string_literal: true

json.array!(@reports) do |report|
  json.name "#{report.name} - #{report.id}"
  json.id report.id
  json.selected params[:hogan_report_id] == report.id
end

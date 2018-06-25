json.array!(@reports) do |report|
  json.name "#{report.report_name} - #{report.report_id}"
  json.id report.report_id
end

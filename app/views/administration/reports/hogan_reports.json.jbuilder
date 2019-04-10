json.array!(@reports) do |report|
  json.name "#{report.name} - #{report.id}"
  json.id report.id
end

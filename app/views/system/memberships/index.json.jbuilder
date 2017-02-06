json.array!(@resources) do |resource|
  json.name resource.decorate.display_name
  json.id resource.id
end

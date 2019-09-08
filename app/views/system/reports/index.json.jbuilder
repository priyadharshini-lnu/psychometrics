# frozen_string_literal: true

json.array!(@resources) do |resource|
  json.extract! resource, :name, :id
end

# frozen_string_literal: true

module JsonApiHelper
  def  jsonapi_relationship_request(relationships)
    relationships.transform_values { |val| { data: val } }
  end

  def jsonapi_remove_attributes(data, attributes)
    attributes = data.dig(:data, :attributes).except(*Array.wrap(attributes))
    data = data.deep_dup
    data[:data][:attributes] = attributes
    data
  end

  def jsonapi_merge_attributes(data, attributes)
    attributes = data.dig(:data, :attributes).deep_merge(attributes)
    data = data.deep_dup
    data[:data][:id] = attributes[:id] if attributes[:id]
    data[:data][:attributes] = attributes.except(:id)
    data
  end

  def jsonapi_remove_relationships(data, attributes)
    relationships = data.dig(:data, :relationships).except(*Array.wrap(attributes))
    data = data.deep_dup
    data[:data][:relationships] = relationships
    data
  end

  def jsonapi_merge_relationships(data, relationships)
    relationships = jsonapi_relationship_request(relationships)
    relationships = data.dig(:data, :relationships).merge(relationships)
    data = data.deep_dup
    data[:data][:relationships] = relationships
    data
  end

  def jsonapi_resource_request(resource_name, attributes = {}, relationships = {})
    data = { type: resource_name }
    data[:id] = attributes[:id] if attributes[:id]
    data[:attributes] = attributes.except(:id)
    data[:relationships] = jsonapi_relationship_request(relationships) if relationships.present?

    { data: data }
  end
end

class JsonApiHelperClass
  extend JsonApiHelper
end

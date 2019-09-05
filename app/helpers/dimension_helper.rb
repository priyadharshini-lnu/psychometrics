module DimensionHelper
  def render_dimension_association_links(resource, keys, append = "_enabled")
    keys = keys.map { |k| k + append }
    attributes = resource.attributes.slice(*keys).reject { |_, v| !v }

    return '' if attributes.none?

    links = attributes.map do |k, v|
      key = k.gsub(/_enabled/, '')
      link_to key, [:administration, resource, key.to_sym]
    end

    ["(", links.join(" / "), ")"].join
  end
end

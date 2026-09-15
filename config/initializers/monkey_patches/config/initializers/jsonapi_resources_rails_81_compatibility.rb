# frozen_string_literal: true

module JsonapiResourcesRails81Compatibility
  def initialize(entities, api_only, shallow, options = nil, **kwargs)
    super(entities, api_only, shallow, **(options || kwargs))
  end
end

ActionDispatch::Routing::Mapper::Resources::Resource.prepend(JsonapiResourcesRails81Compatibility)
ActionDispatch::Routing::Mapper::Resources::SingletonResource.prepend(JsonapiResourcesRails81Compatibility)

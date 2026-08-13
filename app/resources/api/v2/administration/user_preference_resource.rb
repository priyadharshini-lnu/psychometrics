# frozen_string_literal: true

class Api::V2::Administration::UserPreferenceResource < Api::V2::Administration::BaseResource
  attributes :config_key, :category, :payload, :resource_type, :resource_id, :name, :description

  has_one :user
  has_one :resource, polymorphic: true

  filter :category
  filter :config_key
  filter :resource_type
  filter :resource_id

  filter :search, apply: lambda { |records, value, _options|
    records.search(value[0])
  }

  before_create do
    @model.user = context[:user]
  end

  # Create acts as an upsert so clients can POST without tracking whether the row exists.
  before_save do
    if @model.new_record?
      existing = UserPreference.find_by(
        user_id: @model.user_id, category: @model.category, config_key: @model.config_key,
        resource_type: @model.resource_type, resource_id: @model.resource_id
      )
      if existing
        existing.assign_attributes(@model.slice(:payload, :name, :description).compact)
        @model = existing
      end
    end
  end

  def self.creatable_fields(context)
    super - %i[user]
  end

  def self.updatable_fields(context)
    super - %i[user]
  end
end

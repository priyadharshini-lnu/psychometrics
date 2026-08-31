# frozen_string_literal: true

class Api::V2::Administration::NormResource < Api::V2::Administration::BaseResource
  attributes :name, :disabled, :created_at, :updated_at, :norm_type

  has_one :dimension
  has_one :owner, class_name: 'Client'
  has_one :created_by, class_name: 'User'
  has_one :updated_by, class_name: 'User'

  ransack_filters %i[filterable_fields]
  filter :owner_id, apply: lambda { |records, value, _options|
    owner_id = value.is_a?(Array) ? value[0] : value
    records.owned_by_client_or_tte(owner_id)
  }

  before_create do
    @model.created_by_id = context[:user].id
  end

  before_update do
    @model.updated_by_id = context[:user].id
  end

  def created_at
    @model.decorate.created_at
  end

  def updated_at
    @model.decorate.updated_at
  end

  def self.sortable_fields(context)
    super + %i[dimension.name updated_by.name owner.name created_at updated_at]
  end

  def self.apply_sort(records, order_options, context = {})
    order_options.each do |field, direction|
      records = if field.to_s == 'updated_by.name'
                  records.joins(:updated_by).merge(User.send(:"sort_by_full_name_#{direction}"))
                else
                  super(records, { field => direction }, context)
                end
    end
    records
  end

  def meta_details
    {
      permissions: lambda {
        GetPermissionsHash.call!(
          Api::Administration::NormPolicy,
          context[:user],
          @model,
          [
            'edit',
            'copy',
            'export',
            'editor',
            %w[delete destroy]
          ],
          {
            project_id: @model.owner_id
          }
        )
      }
    }
  end
end

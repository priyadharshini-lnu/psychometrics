# frozen_string_literal: true

class Api::V2::Administration::BlockResource < Api::V2::Administration::BaseResource
  attributes :name, :view, :block_type, :position, :props, :disabled, :assessment_id, :template_id,
             :save_as_template, :owner_id, :created_at

  has_one :assessment
  has_one :template, class_name: 'Block'
  has_many :questions
  has_many :linked_assessments
  has_one :owner

  ransack_filters %i[assessment_id_eq filterable_fields name_cont owner_id_eq view_eq]

  before_create do
    @model.view = :templates if context.dig(:params, :filter, :view_eq) == 'templates'
  end

  def self.sortable_fields(context)
    super + %i[active created_at]
  end

  def self.apply_sort(records, order_options, context = {})
    order_options.each do |field, direction|
      if field.to_s == 'active'
        mapped_direction = direction.to_s == 'asc' ? 'desc' : 'asc'
        records = super(records, { disabled: mapped_direction }, context)
      else
        records = super(records, { field => direction }, context)
      end
    end

    records
  end
end

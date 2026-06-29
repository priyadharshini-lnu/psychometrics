# frozen_string_literal: true

class Api::V2::Administration::LibraryResource < Api::V2::Administration::BaseResource
  attributes :name, :type, :description, :type, :created_at,
             :file_is_image, :owner_id, :parent_id, :file_url, :file_icon_url

  has_one :owner, class_name: 'Client'
  has_one :created_by, class_name: 'User'

  delegate :file_url, to: :@model

  ransack_filters %i[filterable_fields with_parent]

  def self.sortable_fields(context)
    super + %i[owner.name created_at]
  end

  def self.records(opts = {})
    return super if opts.dig(:context, :params, :action) == 'destroy'

    if opts.dig(:context, :with_parent).present?
      super.with_parent(opts[:context][:with_parent])
    else
      super.roots
    end
  end

  def created_at
    @model.decorate.created_at
  end

  def file_icon_url
    @model.file_url(:icon)
  end

  def file_is_image
    @model.file.image?
  end
end

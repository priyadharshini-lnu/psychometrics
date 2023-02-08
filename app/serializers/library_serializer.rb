# frozen_string_literal: true

class LibrarySerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :name, :description, :thumb, :file, :icon, :type, :parent_id, :created_at

  def thumb
    object.file.url(:thumb)
  end

  def file
    rails_blob_url(object.as_file, host: Settings.domain, port: Settings.port) || object.file.url
  end

  def icon
    object.decorate.icon
  end

  def created_at
    I18n.l object.created_at, format: :short
  end
end

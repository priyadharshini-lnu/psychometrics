class LibrarySerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :thumb, :icon, :type, :parent_id, :created_at

  def thumb
    object.file.thumb.url
  end

  def icon
    object.decorate.icon
  end

  def created_at
    I18n.l object.created_at, format: :short
  end
end

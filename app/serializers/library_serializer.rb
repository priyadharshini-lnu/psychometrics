# frozen_string_literal: true

# == Schema Information
#
# Table name: libraries
#
#  id             :integer          not null, primary key
#  name           :string
#  description    :text
#  type           :integer          default("folder")
#  file           :string
#  parent_id      :integer
#  lft            :integer          not null
#  rgt            :integer          not null
#  depth          :integer          default(0), not null
#  children_count :integer          default(0), not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

class LibrarySerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :thumb, :file, :icon, :type, :parent_id, :created_at

  def thumb
    object.file.url(:thumb)
  end

  def file
    object.file.url
  end

  def icon
    object.decorate.icon
  end

  def created_at
    I18n.l object.created_at, format: :short
  end
end

# == Schema Information
#
# Table name: reports_modules
#
#  id         :integer          not null, primary key
#  page_id    :integer
#  name       :string
#  props      :json
#  position   :integer
#  deleted_at :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  type       :string
#

module Reports
  class ModuleSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props, :type
  end
end

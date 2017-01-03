# == Schema Information
#
# Table name: reports_pages
#
#  id         :integer          not null, primary key
#  report_id  :integer
#  name       :string
#  props      :json
#  position   :integer
#  deleted_at :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

module Reports
  class PageSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props

    has_many :modules, serializer: Reports::ModuleSerializer
  end
end

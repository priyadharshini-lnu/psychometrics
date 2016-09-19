module Reports
  class PageSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props

    has_many :modules, serializer: Reports::ModuleSerializer
end

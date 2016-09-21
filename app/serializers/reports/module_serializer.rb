module Reports
  class ModuleSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props, :type
  end
end

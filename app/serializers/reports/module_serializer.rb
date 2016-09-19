module Reports
  class ModuleSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :props, :deleted, :created_at

    def deleted
      !!object.deleted_at
    end
  end
end

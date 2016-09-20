module Reports
  class PageSerializer < ActiveModel::Serializer
    attributes :id, :name, :position, :deleted, :props, :created_at

    #
    has_many :modules, serializer: Reports::ModuleSerializer

    def deleted
      !!object.deleted_at
    end

    def created_at
      I18n.l object.created_at, format: :short
    end
  end
end

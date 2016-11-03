module Reports
  class FilterSerializer < ActiveModel::Serializer
    attributes :id, :name, :conditions
  end
end

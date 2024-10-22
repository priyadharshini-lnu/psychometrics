# frozen_string_literal: true

module Administration
  class SheetColumnSerializer < Panko::Serializer
    attributes :id, :name, :column_type, :dashboard_use, :accessor_access, :visible_in_list, :position
  end
end

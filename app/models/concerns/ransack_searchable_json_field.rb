# frozen_string_literal: true

module RansackSearchableJsonField
  extend ActiveSupport::Concern

  class_methods do
    def ransack_searchable_json_fields(*attributes, column:)
      attributes.each do |attr|
        ransacker attr do |parent|
          Arel::Nodes::InfixOperation.new('->>', parent.table[column], Arel::Nodes.build_quoted(attr.to_s))
        end
      end
    end
  end
end

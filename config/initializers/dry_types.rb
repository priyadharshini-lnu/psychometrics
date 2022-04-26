# frozen_string_literal: true

module Types
  include Dry.Types()
end


Dry::Schema::Macros::Key.class_eval do
  def relationships(details)
    value(
      CustomTypes::Relationship.relationships(details)
    )
  end
end

Dry::Swagger::ContractParser.class_eval do
  def visit_namespace(node, opts = {})
    _, rest = node
    visit(rest, opts)
  end
end

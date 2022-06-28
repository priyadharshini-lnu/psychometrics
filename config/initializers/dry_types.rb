# frozen_string_literal: true

Dry::Schema.config.messages.backend = :i18n
Dry::Schema.config.messages.top_namespace = :dry_errors

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

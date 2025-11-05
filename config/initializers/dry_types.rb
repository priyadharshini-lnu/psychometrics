# frozen_string_literal: true

dry_error_translation_file_path = Dir.glob(['config/locales/**/dry_errors.yml'])
Dry::Schema.config.messages.backend = :i18n
Dry::Schema.config.messages.top_namespace = :dry_errors
Dry::Schema.config.messages.load_paths += dry_error_translation_file_path

Dry::Validation::Contract.config.messages.backend = :i18n
Dry::Validation::Contract.config.messages.top_namespace = :dry_errors
Dry::Validation::Contract.config.messages.load_paths += dry_error_translation_file_path

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

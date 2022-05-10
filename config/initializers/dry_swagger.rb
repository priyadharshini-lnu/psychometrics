# frozen_string_literal: true

Dry::Swagger::Config::StructConfiguration.configuration do |config|
  config.enable_required_validation = true
  config.enable_nullable_validation = true
  config.enable_enums = true
  config.enable_descriptions = true
  config.nullable_type = :nullable
end

Dry::Swagger::Config::ContractConfiguration.configuration do |config|
  config.enable_required_validation = true
  config.enable_nullable_validation = true
  config.enable_enums = true
  config.enable_descriptions = true
  config.nullable_type = :nullable
end

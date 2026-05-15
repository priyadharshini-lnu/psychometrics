# frozen_string_literal: true

require './app/core/json_api/audit_log_processor'

# This line is needed for json-resouce gem to send proper status code back.
Rack::Utils::SYMBOL_TO_STATUS_CODE[:unprocessable_entity] = 422

JSONAPI.configure do |config|
  config.default_processor_klass = JsonApi::AuditLogProcessor
  config.exception_class_whitelist = [Pundit::NotAuthorizedError]
  config.json_key_format = :underscored_key
  config.route_format = :underscored_route

  config.allow_include = true
  config.allow_sort = true
  config.allow_filter = true
  config.use_relationship_reflection = true

  config.raise_if_parameters_not_allowed = true

  config.default_paginator = :paged

  config.top_level_links_include_pagination = false

  config.default_page_size = 25
  config.maximum_page_size = 300

  config.top_level_meta_include_record_count = true
  config.top_level_meta_record_count_key = :record_count

  config.top_level_meta_include_page_count = true
  config.top_level_meta_page_count_key = :page_count

  config.use_text_errors = false

  config.exception_class_whitelist = []

  config.always_include_to_one_linkage_data = true
  config.whitelist_all_exceptions = true
  config.warn_on_missing_routes = false
end

# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Add new mime types for use in respond_to blocks:
# Mime::Type.register "text/richtext", :rtf

Rack::Mime::MIME_TYPES['.mjs'] = 'text/javascript'

# Rails' reloader resets ActionDispatch::Request.parameter_parsers on every reload cycle,
# wiping the :api_json MIME type registered by jsonapi-resources. Reinstalling on every
# reload ensures vnd.api+json request bodies are parsed correctly.
#
# lambda accepting both :json and :api_json, fixing RoutingError on vnd.api+json requests.
Rails.application.reloader.to_run { JSONAPI::MimeTypes.install }

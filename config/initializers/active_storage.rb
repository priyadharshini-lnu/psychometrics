# frozen_string_literal: true

ActiveStorage::Engine.config.active_storage.content_types_to_serve_as_binary.delete 'image/svg+xml'

Rails.application.config.active_storage.content_types_allowed_inline += [
  'video/mp4'
]

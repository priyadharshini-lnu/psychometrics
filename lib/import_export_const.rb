# frozen_string_literal: true

module ImportExportConst
  NOT_APPLICABLE_PLACEHOLDER = '_NA_'
  EMAIL_QUESTION_FIELDS = %w[to cc bcc subject message].freeze
  EMAIL_QUESTION_TEXT_FIELDS = %w[subject message].freeze
  FILE_IMPORT_EXPORT_FIELDS = %w[file_url media_id].freeze
  AUDIO_IMPORT_EXPORT_FIELDS = %w[audio_url media_id].freeze
  VIDEO_IMPORT_EXPORT_FIELDS = %w[selected_video_url non_selected_video_urls media_id].freeze
end

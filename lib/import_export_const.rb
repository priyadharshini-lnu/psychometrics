# frozen_string_literal: true

module ImportExportConst
  NOT_APPLICABLE_PLACEHOLDER = '_NA_'
  EMAIL_QUESTION_FIELDS = %w[to cc bcc subject message].freeze
  EMAIL_QUESTION_TEXT_FIELDS = %w[subject message].freeze
  SINGLE_MEDIA_IMPORT_EXPORT_FIELDS = %w[file_url transcription media_id duration].freeze
  VIDEO_IMPORT_EXPORT_FIELDS = %w[selected_video_url selected_transcription non_selected_video_urls media_id
                                  duration].freeze
  DURATION = 'duration'
  SUPPORT_ROWS = 3
  SKIP_ROWS = SUPPORT_ROWS + 2 # for calculate right index of row in Excel (import)
  AGILE_DATE_FIELDS = %w[start_time end_time].freeze
end

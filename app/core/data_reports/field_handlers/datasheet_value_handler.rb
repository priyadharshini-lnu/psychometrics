# frozen_string_literal: true

module DataReports::FieldHandlers
  class DatasheetValueHandler < ::DataReports::BaseFieldHandler
    def call
      broadcast :ok, datasheet_value
    end

    def datasheet_value
      ctx[:datasheets]&.dig(cu.user.email, field['field_name'])
    end
  end
end

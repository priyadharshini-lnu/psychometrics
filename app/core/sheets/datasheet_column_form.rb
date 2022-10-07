# frozen_string_literal: true

module Sheets
  class DatasheetColumnForm < BaseColumnForm
    mimic :column

    attribute :dashboard_use, Boolean
    attribute :accessor_access, Boolean
  end
end

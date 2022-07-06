# frozen_string_literal: true

module Datasheets
  class DatasheetColumnsForm < Rectify::Form
    attribute :columns, Array[Datasheets::DatasheetColumnForm]
  end
end

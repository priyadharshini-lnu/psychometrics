# frozen_string_literal: true

class Sheet < ApplicationRecord
  self.table_name = 'datasheets'

  EMAIL_COLUMN = 'Email'
  ADVANCE_TYPES = %w[HTML Markdown].freeze
  ALL_COLUMN_TYPES = %w[String Text Number HTML Markdown].freeze
  MAX_COLUMN_NAME_SIZE = 64

  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  has_many :rows, class_name: 'DatasheetRow', foreign_key: :datasheet_id, inverse_of: :datasheet, dependent: :destroy

  def column_names
    columns.map { |col| col['name'] }
  end

  def parent_resource
    @parent_resource ||= project || campaign
  end
end

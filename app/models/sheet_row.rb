# frozen_string_literal: true

class SheetRow < ApplicationRecord
  audited

  belongs_to :sheet, inverse_of: :rows
  has_many :sheet_row_data, dependent: :destroy

  before_save { self.email = email&.downcase }
  after_save :sync_data, if: proc { data_previously_changed? }

  delegate :columns, to: :sheet

  def sync_data
    return unless data

    columns = sheet.sheet_columns.to_a
    data.each do |field, value|
      column = columns.find { |c| c.name == field }
      next unless column

      row_data = sheet_row_data.find_or_create_by(sheet_column_id: column.id)
      if column.column_type == 'number'
        row_data.numeric_value = value
      else
        row_data.string_value = value
      end
      row_data.save!
    end
    update(migrated: true)
  end

  def datasheet
    sheet
  end

  def log_attribute_for_delete
    slice(:id, :email, :data)
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id sheet_id email]
  end
end

# frozen_string_literal: true

module Sheets
  class ParseFile < Rectify::Command
    private_attr_reader :form, :parent_resource, :sheet, :sheet_type

    def initialize(form, parent_resource, sheet_type)
      @form = form
      @parent_resource = parent_resource
      @sheet_type = sheet_type
    end

    def call
      transaction do
        parent_resource.sheets.find_by(type: sheet_type)&.destroy if sheet_type == 'Accesssheet'
        create_and_update_sheet
        parse_file
      end

      broadcast :ok, sheet
    end

    private

    def create_column(name, column_type)
      is_email = name == Sheet::EMAIL_COLUMN
      column = {
        name: name.chomp,
        column_type: SheetColumn::COLUMN_TYPES[column_type],
        visible_in_list: is_email
      }
      column = column.merge(dashboard_use: is_email, accessor_access: is_email) if sheet_type == 'Datasheet'
      column
    end

    def create_and_update_sheet
      @sheet ||= parent_resource.sheets.find_or_create_by(
        type: sheet_type
      )

      columns_in_file = form.parsed_file.second
      columns = sheet.sheet_columns || []
      columns_in_file.each do |name, type|
        sheet.sheet_columns.create!(create_column(name, type)) unless columns.find_by(name: name)
      end
    end

    def parse_file
      form.data_rows.each do |data|
        email = data[Sheet::EMAIL_COLUMN].strip
        next if email.blank?

        row = accesssheet? ? sheet.rows.new(email: email) : sheet.rows.find_or_initialize_by(email: email)
        data = data.reject { |k, _v| k == Sheet::EMAIL_COLUMN }
        row.data = (row.data || {}).merge(data.transform_values { |v| v.is_a?(String) ? v.strip : v })
        row.save!
      end
    end

    def accesssheet?
      sheet_type == 'Accesssheet'
    end
  end
end

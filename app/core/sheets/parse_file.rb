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
        parent_resource.sheets.find_by(type: sheet_type)&.destroy if accesssheet?
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
        column_type: is_email ? :string : SheetColumn::COLUMN_TYPES[column_type],
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
        data.transform_values! { |value| Utility::String.remove_csv_injection_marker(value) }
        email = data[Sheet::EMAIL_COLUMN].strip
        next if email.blank?

        row = accesssheet? ? sheet.rows.create(email: email) : sheet.rows.find_or_create_by(email: email)
        ::SheetRows::UpsertData.call(sheet, email, data)
        row.update(migrated: true)
      end
    end

    def accesssheet?
      sheet_type == 'Accesssheet'
    end
  end
end

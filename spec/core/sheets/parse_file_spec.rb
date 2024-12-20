# frozen_string_literal: true

require 'rails_helper'

describe Sheets::ParseFile do
  let(:file) { double('file', content_type: 'application/xlsx', original_filename: 'sheet file name') }
  let(:form) do
    stub_form(valid?: true, file: file, data_rows: data_rows,
              parsed_file: parsed_file, id: nil)
  end
  let(:parsed_file) do
    [
      { 'Email' => 'Email', 'key' => 'Text' },
      { 'Email' => 'Text', 'key' => 'Text' },
      { 'Email' => email, 'key' => 'value' }
    ]
  end
  let(:data_rows) do
    [
      { 'Email' => email, 'key' => 'value', 'value' => '' }
    ]
  end
  let(:email)       { 'test@email.com' }
  let(:project)     { create(:project) }
  let(:columns) do
    [
      {
        'name' => 'Email',
        'column_type' => 'text',
        'accessor_access' => true,
        'dashboard_use' => true,
        'visible_in_list' => true
      }, {
        'name' => 'key',
        'column_type' => 'text',
        'accessor_access' => false,
        'dashboard_use' => false,
        'visible_in_list' => false
      }
    ]
  end
  subject { described_class.call(form, project, 'Datasheet') }

  context 'sheet is Accesssheet' do
    it 'deletes existing record' do
      sheet = project.sheets.create!(columns: columns, type: 'Accesssheet')
      described_class.call(form, project, 'Accesssheet')
      expect(Sheet.find_by(id: sheet.id)).to eq(nil)
    end
  end

  it 'creates valid sheet' do
    expect { subject }.to change { Sheet.count }.from(0).to(1)
    sheet = project.sheets.first
    expect(sheet.project).to eq(project)
    expect(sheet.sheet_columns.map do |c|
             c.slice(:name, :column_type, :accessor_access, :dashboard_use, :visible_in_list)
           end).to eq(columns)
  end

  it 'creates valid sheet row' do
    expect { subject }.to change { Sheet.count }.from(0).to(1)
    sheet_row = project.sheets.first.rows.last
    expect(sheet_row.email).to eq(email)
    expect(sheet_row.sheet_row_data.reduce({}) do |acc, d|
             acc.merge(d.sheet_column.name => d.value)
           end).to eq({ 'key' => 'value' })
  end

  it 'merge exists sheet row data' do
    sheet = project.sheets.create(columns: columns)
    column = sheet.sheet_columns.create(name: 'Name', column_type: 'string')
    sheet_row = sheet.rows.create(email: email)
    sheet_row.sheet_row_data.create(sheet_column: column, string_value: 'James')
    subject

    expect(sheet_row.reload.sheet_row_data.reduce({}) do |acc, d|
      acc.merge(d.sheet_column.name => d.value)
    end).to eq({ 'key' => 'value', 'Name' => 'James' })
  end
end

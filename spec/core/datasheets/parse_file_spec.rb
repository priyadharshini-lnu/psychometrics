# frozen_string_literal: true

require 'rails_helper'

describe Datasheets::ParseFile do
  let(:file) { double('file', content_type: 'application/xlsx', original_filename: 'datasheet file name') }
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
        'type' => 'Text',
        'accessor_access' => true,
        'dashboard_use' => true,
        'visible_in_list' => true
      }, {
        'name' => 'key',
        'type' => 'Text',
        'accessor_access' => false,
        'dashboard_use' => false,
        'visible_in_list' => false
      }
    ]
  end
  subject { described_class.call(form, project) }

  it 'creates valid datasheet' do
    expect { subject }.to change { Datasheet.count }.from(0).to(1)
    datasheet = project.datasheet
    expect(datasheet.project).to eq(project)
    expect(datasheet.columns).to eq(columns)
  end

  it 'creates valid datasheet row' do
    expect { subject }.to change { Datasheet.count }.from(0).to(1)
    datasheet_row = project.datasheet.rows.last
    expect(datasheet_row.email).to eq(email)
    expect(datasheet_row.data).to eq({ 'key' => 'value', 'value' => '' })
  end

  it 'merge exists datasheet row data' do
    datasheet = project.create_datasheet(columns: columns)
    datasheet_row = datasheet.rows.create(email: email, data: { 'Name' => 'James' })

    subject

    expect(datasheet_row.reload.data).to eq({ 'key' => 'value', 'value' => '', 'Name' => 'James' })
  end
end

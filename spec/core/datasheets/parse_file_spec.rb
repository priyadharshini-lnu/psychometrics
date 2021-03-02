# frozen_string_literal: true

require 'rails_helper'

describe Datasheets::ParseFile do
  let(:file)        { double('file', content_type: 'application/xlsx', original_filename: 'datasheet file name') }
  let(:form)        { stub_form(valid?: true, file: file, parsed_file: parsed_file, id: nil, replace_existing?: true) }
  let(:parsed_file) do
    [
      { 'Email' => 'Email', 'key' => 'Text' },
      { 'Email' => 'Text', 'key' => 'Text' },
      { 'Email' => email, 'key' => 'value' }
    ]
  end
  let(:email)       { 'test@email.com' }
  let(:project)     { create(:project) }

  subject { described_class.call(form, project) }

  it 'creates valid datasheet' do
    expect { subject }.to change { Datasheet.count }.from(0).to(1)
    datasheet = Datasheet.last
    expect(datasheet.project).to eq(project)
    expect(datasheet.columns).to eq(parsed_file.second)
  end

  it 'creates valid datasheet row' do
    expect { subject }.to change { DatasheetRow.count }.from(0).to(1)
    datasheet_row = DatasheetRow.last
    expect(datasheet_row.email).to eq(email)
    expect(datasheet_row.data).to eq(parsed_file.last.except('Email'))
  end

  it 'replaces datasheet row data if replace_existing? is true' do
    datasheet = project.create_datasheet(columns: { 'Email' => 'Text', 'key' => 'Text' })
    datasheet_row = datasheet.rows.create(email: email, data:  { 'Name' => 'James' })

    subject

    expect(datasheet_row.reload.data).to eq({ 'key' => 'value' })
  end

  it 'merges datasheet row data if replace_existing? is false' do
    datasheet = project.create_datasheet(columns: { 'Email' => 'Text', 'key' => 'Text' })
    datasheet_row = datasheet.rows.create(email: email, data:  { 'Name' => 'James' })
    allow(form).to receive(:replace_existing?).and_return(false)

    subject

    expect(datasheet_row.reload.data).to eq({ 'Name' => 'James', 'key' => 'value' })
  end
end

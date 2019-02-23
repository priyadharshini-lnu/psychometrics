require 'rails_helper'

describe Datasheets::ParseFile do
  let(:file)        { double('file', content_type: 'application/xlsx', original_filename: 'datasheet file name') }
  let(:form)        { stub_form(valid?: true, file: file, parsed_file: parsed_file, id: nil) }
  let(:parsed_file) { [{ 'Email Address' => 'text', 'key' => 'text' }, { 'Email Address' => email, 'key' => 'value' }] }
  let(:email)       { 'test@email.com' }
  let(:project)     { create(:project) }

  subject { described_class.call(form, project) }

  it 'broadcast :invalid' do
    allow(form).to receive(:invalid?).and_return(true)
    expect(subject).to eq(invalid: [])
  end

  it 'creates valid datasheet' do
    expect { subject }.to change { Datasheet.count }.from(0).to(1)
    datasheet = Datasheet.last
    expect(datasheet.project).to eq(project)
    expect(datasheet.columns).to eq(parsed_file.first)
  end

  it 'creates valid datasheet row' do
    expect { subject }.to change { DatasheetRow.count }.from(0).to(1)
    datasheet_row = DatasheetRow.last
    expect(datasheet_row.email).to eq(email)
    expect(datasheet_row.data).to eq(parsed_file.last.except('Email Address'))
  end

  xit 'sanitize email column'

  xit 'update datasheet'

  # context 'normal flow' do
  #
  # end
end

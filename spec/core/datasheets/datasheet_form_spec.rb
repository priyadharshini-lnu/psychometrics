require 'rails_helper'

describe Datasheets::DatasheetForm do
  it { should validate_presence_of(:file) }

  context 'Validation' do
    let(:file) { double('file', content_type: 'application/xlsx') }
    let(:form) { described_class.new({ file: file, parsed_file: parsed_file }) }
    let(:parsed_file) { [{ 'Email Address' => 'test@email.com' }] }
    subject { form }

    context 'failure flow' do
      it '#has_email_column' do
        allow(form).to receive(:parsed_file).and_return([{ 'No Email Column' => true }])
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include({ error: :no_email_column })
      end
      it '#no_duplicates' do
        allow(form).to receive(:parsed_file).and_return(parsed_file.push({ 'Email Address' => 'test@email.com' }))
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include({ error: :email_duplicate })
      end
    end

    it 'successfully flow' do
      allow(form).to receive(:parsed_file).and_return(parsed_file)
      is_expected.to be_valid
    end
  end
end

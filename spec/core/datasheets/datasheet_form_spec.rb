# frozen_string_literal: true

require 'rails_helper'

describe ::Datasheets::DatasheetForm do
  context 'Validation' do
    let(:file) { double('file', content_type: 'application/xlsx') }
    let(:parsed_file) { [{ 'Email' => nil }, { 'Email' => 'String' }, { 'Email' => 'test@email.com' }] }
    let(:form) { described_class.new(file: file, parsed_file: parsed_file) }
    subject { form }

    context 'failure flow' do
      it '#validate_presence_of' do
        allow(form).to receive(:file).and_return(nil)
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include(error: :blank)
      end

      it '#has_email_column' do
        allow(form).to receive(:parsed_file).and_return([{ 'No Email Column' => true }])
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include(error: :no_email_column)
      end

      it '#no_duplicates' do
        parsed_file = [
          { 'Email' => nil }, { 'Email' => 'String' }, { 'Email' => 'test@email.com' }, { 'Email' => 'test@email.com' }
        ]
        allow(form).to receive(:parsed_file).and_return(parsed_file)
        is_expected.to be_invalid

        expect(form.errors.details[:file]).to include(error: :email_duplicate)
      end
    end

    it 'validates column type' do
      parsed_file = [{ 'Email' => nil }, { 'Email' => 'String1' }, { 'Email' => 'test@email.com' }]
      allow(form).to receive(:parsed_file).and_return(parsed_file)

      is_expected.to be_invalid
      expect(form.errors.details[:file]).to include(error: :invalid_column_type)
    end

    it 'validates presence of Email value' do
      parsed_file = [{ 'Email' => nil }, { 'Email' => 'String' }, { 'Email' => '' }]
      allow(form).to receive(:parsed_file).and_return(parsed_file)

      is_expected.to be_invalid
      expect(form.errors.details[:file]).to include(error: :email_blank, row_number: 3)
    end

    it 'successfully flow' do
      allow(form).to receive(:parsed_file).and_return(parsed_file)

      is_expected.to be_valid
    end
  end
end

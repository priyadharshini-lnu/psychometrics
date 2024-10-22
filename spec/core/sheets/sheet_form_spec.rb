# frozen_string_literal: true

require 'rails_helper'

describe ::Sheets::SheetForm do
  context 'Validation' do
    let(:file) { double('file', content_type: 'application/xlsx') }
    let(:parsed_file) { [{ 'Email' => nil }, { 'Email' => 'String' }, { 'Email' => 'test@email.com' }] }
    let(:form) { described_class.new(file: file, parsed_file: parsed_file).with_context(sheet_type: 'Datasheet') }
    subject { form }

    before do
      allow(form).to receive(:roo_excel).and_return(double(first: []))
    end

    context 'sheet is Accesssheet' do
      it 'allows duplicate email id' do
        parsed_file = [
          { 'Email' => nil }, { 'Email' => 'String' }, { 'Email' => 'test@email.com' }, { 'Email' => 'test@email.com' }
        ]
        form = described_class.new(file: file, parsed_file: parsed_file).with_context(sheet_type: 'Accesssheet')
        allow(form).to receive(:roo_excel).and_return(double(first: []))

        allow(form).to receive(:parsed_file).and_return(parsed_file)
        expect(form.valid?).to eq(true)
      end
    end

    context 'validate columns' do
      before do
        allow(form).to receive(:parsed_file).and_return([{
          'AaZaQZz1vpRFU2oURobncb_hsdz8hS1xbssPJws_w1eqE6_yWtVWgm4AwGLJoZyjC' => nil
        }])
      end

      it 'validates column type' do
        parsed_file = [{ 'Email' => nil }, { 'Email' => 'String1' }, { 'Email' => 'test@email.com' }]
        allow(form).to receive(:parsed_file).and_return(parsed_file)

        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include(error: :invalid_column_type)
      end
    end

    context 'validate column content' do
      before do
        allow(form).to receive(:parsed_file).and_return(
          [
            { 'Email' => nil, 'Str' => nil, 'Num' => nil },
            { 'Email' => 'Text', 'Str' => 'String', 'Num' => 'Number' },
            { 'Email' => 'test3@aa.aa', 'Str' => Devise.friendly_token(258) },
            { 'Email' => 'test4@aa.aa', 'Str' => 'valid' },
            { 'Email' => 'test5@aa.aa', 'Str' => Devise.friendly_token(258) },
            { 'Email' => 'test6@aa.aa', 'Num' => '1' },
            { 'Email' => 'test7@aa.aa', 'Num' => 1.5 },
            { 'Email' => 'test8@aa.aa', 'Num' => 5 },
            { 'Email' => 'test9@aa.aa', 'Num' => nil },
            { 'Email' => 'test10@aa.aa', 'Num' => 'string' }
          ]
        )
      end

      it 'validates string values' do
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include(error: :invalid_string_value_size, column: 'Str', index: 3)
        expect(form.errors.details[:file]).to include(error: :invalid_string_value_size, column: 'Str', index: 5)
      end

      it 'validates number values' do
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include(error: :invalid_number_value, column: 'Num', index: 6)
        expect(form.errors.details[:file]).to include(error: :invalid_number_value, column: 'Num', index: 10)
      end
    end

    context 'failure flow' do
      let(:sheet) do
        create(:sheet, columns: [{ type: 'String', name: 'Email' },
                                 { type: 'String', name: 'test' }])
      end
      let!(:columns) do
        sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string')
        sheet.sheet_columns << create(:sheet_column, sheet: sheet, name: 'test', column_type: 'string')
      end

      it '#validate_presence_of' do
        allow(form).to receive(:file).and_return(nil)
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include(error: :blank)
      end

      it '#has_email_column' do
        allow(form).to receive(:parsed_file).and_return([{ 'No Email Column' => nil }])
        allow(form).to receive(:column_types).and_return([])
        allow(form).to receive(:data_rows).and_return([])
        is_expected.to be_invalid
        expect(form.errors.details[:file]).to include(error: :no_email_column)
      end

      it '#validate_column_types_matching' do
        parsed_file = [
          { 'Email' => nil, 'test' => nil }, { 'Email' => 'String', 'test' => 'Number' }
        ]
        allow(form).to receive(:parsed_file).and_return(parsed_file)
        form.with_context(sheet: sheet)
        is_expected.to be_invalid

        expect(form.errors.details[:file]).to include({
          col: 'test', error: :column_type_mismatch, got: 'Number', type: 'String'
        })
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

    it 'validates presence of Email value' do
      parsed_file = [{ 'Email' => nil }, { 'Email' => 'String' }, { 'Email' => '' }]
      allow(form).to receive(:parsed_file).and_return(parsed_file)

      is_expected.to be_invalid
      expect(form.errors.details[:file]).to include(error: :email_blank, row_number: 3)
    end

    it 'validates Email format' do
      parsed_file = [{ 'Email' => nil }, { 'Email' => 'String' }, { 'Email' => 'invalid_email' }]
      allow(form).to receive(:parsed_file).and_return(parsed_file)

      is_expected.to be_invalid
      expect(form.errors.details[:file]).to include(error: :email_invalid, row_number: 3)
    end

    it 'successfully flow' do
      allow(form).to receive(:parsed_file).and_return(parsed_file)

      is_expected.to be_valid
    end
  end
end

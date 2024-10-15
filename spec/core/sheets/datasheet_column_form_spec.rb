# frozen_string_literal: true

require 'rails_helper'

describe ::Sheets::DatasheetColumnForm do
  context 'Validation' do
    let!(:sheet) do
      create(:sheet, columns: [
        { name: 'Email', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true },
        { name: 'Uniq', type: 'String', accessor_access: true, dashboard_use: true, visible_in_list: true }
      ])
    end
    let!(:columns) do
      create(:sheet_column, sheet: sheet, name: 'Email', column_type: 'string')
      create(:sheet_column, sheet: sheet, name: 'Uniq', column_type: 'string')
    end

    context 'validate column' do
      it '#column should be valid' do
        form = described_class.new({ name: 'Name', column_type: 'string',
                                     accessor_access: true, dashboard_use: true, visible_in_list: true })

        expect(form).to be_valid
      end
    end

    context 'invalid column' do
      it 'should be invalid name' do
        form = described_class.new({ name: 'E' * 65, column_type: 'string',
                                     accessor_access: true, dashboard_use: true, visible_in_list: true })

        expect(form).to be_invalid
        expect(form.errors[:name]).to include('is too long (maximum is 64 characters)')
      end

      it 'should be invalid type' do
        form = described_class.new({ name: 'Name', column_type: 'Type',
                                     accessor_access: true, dashboard_use: true, visible_in_list: true })

        expect(form).to be_invalid
        expect(form.errors[:column_type]).to include('is not included in the list')
      end

      it 'should be uniq name' do
        form = described_class.new(
          name: 'Uniq', column_type: 'string',
          accessor_access: true, dashboard_use: true, visible_in_list: true
        ).with_context(sheet: sheet, form_type: :add)

        expect(form).to be_invalid
        expect(form.errors[:name]).to include('This field is already present')
      end
    end
  end
end

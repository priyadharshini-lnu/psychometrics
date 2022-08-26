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

    context 'validate column' do
      it '#column should be valid' do
        form = described_class.new({ name: 'Name', type: 'String',
                                     accessor_access: true, dashboard_use: true, visible_in_list: true })

        expect(form).to be_valid
      end
    end

    context 'invalid column' do
      it 'should be invalid name' do
        form = described_class.new({ name: 'Na\\me', type: 'String',
                                     accessor_access: true, dashboard_use: true, visible_in_list: true })

        expect(form).to be_invalid
        expect(form.errors[:name]).to include('is invalid')
      end

      it 'should be invalid type' do
        form = described_class.new({ name: 'Name', type: 'Type',
                                     accessor_access: true, dashboard_use: true, visible_in_list: true })

        expect(form).to be_invalid
        expect(form.errors[:type]).to include('is not included in the list')
      end

      it 'should be uniq name' do
        form = described_class.new(
          name: 'Uniq', type: 'String',
          accessor_access: true, dashboard_use: true, visible_in_list: true
        ).with_context(sheet: sheet)

        expect(form).to be_invalid
        expect(form.errors[:name]).to include('This field is already present')
      end
    end
  end
end

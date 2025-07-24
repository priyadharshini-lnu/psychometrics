# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::ResolveEvaluatorCriteria do
  let(:user) { create(:user, email: 'user@a.com') }
  let(:subject) { create(:user, email: 'subject@a.com') }
  let(:campaign) { create(:threesixty_campaign) }
  let(:datasheet) do
    create(:datasheet, project_id: campaign.project.id)
  end
  let(:columns) do
    [
      create(:sheet_column, sheet: datasheet, name: 'Age', column_type: 'number'),
      create(:sheet_column, sheet: datasheet, name: 'No.', column_type: 'number')
    ]
  end
  let(:r1) { create(:sheet_row, sheet: datasheet, email: user.email) }
  let(:r2) { create(:sheet_row, sheet: datasheet, email: subject.email) }

  describe '.call check conditions' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], numeric_value: 1)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], numeric_value: 2)
      @criteria = [
        { 'field' => 'No.', 'value' => '1', 'comparator' => 'equal' },
        { 'field' => 'Age', 'comparator' => 'is_same_as_subject' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be true
    end
  end

  describe '.call check falsy condition' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], numeric_value: 1)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], numeric_value: 20)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], numeric_value: 2)
      @criteria = [
        { 'field' => 'No.', 'value' => '1', 'comparator' => 'equal' },
        { 'field' => 'Age', 'comparator' => 'is_same_as_subject' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end

  describe '.call check same as subject condition' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], numeric_value: 1)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], numeric_value: 2)
      @criteria = [
        { 'field' => 'Age', 'comparator' => 'is_same_as_subject' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be true
    end
  end

  describe '.call check same as subject falsy condition' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], numeric_value: 1)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], numeric_value: 20)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], numeric_value: 2)
      @criteria = [
        { 'field' => 'Age', 'comparator' => 'is_same_as_subject' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end

  describe '.call check single condition' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], numeric_value: 1)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], numeric_value: 20)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], numeric_value: 2)
      @criteria = [
        { 'field' => 'No.', 'value' => '1', 'comparator' => 'equal' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be true
    end
  end

  describe '.call check falsy single condition' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], numeric_value: 1)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], numeric_value: 20)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], numeric_value: 2)
      @criteria = [
        { 'field' => 'No.', 'value' => '2', 'comparator' => 'equal' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end

  describe '.call check condition without datasheets' do
    before do
      @criteria = [
        { 'field' => 'No.', 'value' => '2', 'comparator' => 'equal' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end

  describe '.call check condition without evaluator datasheets' do
    before do
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[0], numeric_value: 20)
      create(:sheet_row_datum, sheet_row: r2, sheet_column: columns[1], numeric_value: 2)
      @criteria = [
        { 'field' => 'No.', 'value' => '2', 'comparator' => 'equal' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end

  describe '.call check condition without subject datasheets' do
    before do
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], numeric_value: 21)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], numeric_value: 1)

      @criteria = [
        { 'field' => 'No.', 'value' => '2', 'comparator' => 'equal' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end
end

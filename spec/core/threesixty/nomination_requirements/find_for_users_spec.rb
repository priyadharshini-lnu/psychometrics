# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::NominationRequirements::FindForUsers do
  let(:current_user) { create(:user, email: 'daniel@cc.com') }
  let(:campaign) { create(:threesixty_campaign) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign, user: current_user) }
  let(:datasheet) { create(:datasheet, project: campaign.project) }
  let!(:columns) do
    [
      create(:sheet_column, sheet: datasheet, name: 'YearOfJoining', column_type: 'string'),
      create(:sheet_column, sheet: datasheet, name: 'Age', column_type: 'string'),
      create(:sheet_column, sheet: datasheet, name: 'Rank', column_type: 'string')
    ]
  end
  it 'returns first nomination requirement if subject_condition is empty' do
    create(:sheet_row, sheet: datasheet, email: current_user.email)
    nomination_requirement = create(:threesixty_nomination_requirement,
                                    threesixty_campaign_id: campaign.id, subject_conditions: [])

    expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nomination_requirement)
  end

  it 'returns nill when there are no nomination_requirements' do
    create(:sheet_row, sheet: datasheet, email: current_user.email)

    expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
  end

  it 'returns nomination with empty condition when there are no datasheet rows present for the user' do
    nomination_requirement = create(:threesixty_nomination_requirement,
                                    threesixty_campaign_id: campaign.id, subject_conditions: [])

    expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nomination_requirement)
  end

  describe '.call with nested AND conditions' do
    before do
      subject_conditions = [
        {
          'operator' => 'if',
          'conditions' => [
            { 'operator' => 'if', 'field' => 'YearOfJoining', 'comparator' => 'equal', 'value' => '2016' },
            { 'operator' => 'and', 'field' => 'Age', 'comparator' => 'equal', 'value' => '20' }
          ]
        },
        {
          'operator' => 'and',
          'conditions' => [
            { 'operator' => 'if', 'field' => 'Rank', 'comparator' => 'equal', 'value' => 'General' },
            { 'operator' => 'or', 'field' => 'Rank', 'comparator' => 'equal', 'value' => 'Major' }
          ]
        }
      ]
      @nomination_requirement = create(:threesixty_nomination_requirement,
                                       threesixty_campaign_id: campaign.id, subject_conditions: subject_conditions)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'General')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(@nomination_requirement)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Major')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(@nomination_requirement)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2017')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Major')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '21')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Major')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Sergeant')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
    end
  end

  describe '.call with nested OR conditions' do
    before do
      subject_conditions = [
        {
          'operator' => 'if',
          'conditions' => [
            { 'operator' => 'if', 'field' => 'YearOfJoining', 'comparator' => 'equal', 'value' => '2016' },
            { 'operator' => 'and', 'field' => 'Age', 'comparator' => 'equal', 'value' => '20' }
          ]
        },
        {
          'operator' => 'or',
          'conditions' => [
            { 'operator' => 'if', 'field' => 'Rank', 'comparator' => 'equal', 'value' => 'General' },
            { 'operator' => 'or', 'field' => 'Rank', 'comparator' => 'equal', 'value' => 'Major' }
          ]
        }
      ]

      @nomination_requirement = create(:threesixty_nomination_requirement,
                                       threesixty_campaign_id: campaign.id, subject_conditions: subject_conditions)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Sergeant')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(@nomination_requirement)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Major')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(@nomination_requirement)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '21')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Sergeant')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2017')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[2], string_value: 'Sergeant')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
    end
  end

  describe '.call with single condition' do
    before do
      subject_conditions = [
        {
          'operator' => 'if',
          'conditions' => [
            { 'operator' => 'if', 'field' => 'YearOfJoining', 'comparator' => 'equal', 'value' => '2016' },
            { 'operator' => 'and', 'field' => 'Age', 'comparator' => 'equal', 'value' => '20' }
          ]
        }
      ]

      @nomination_requirement = create(:threesixty_nomination_requirement,
                                       threesixty_campaign_id: campaign.id, subject_conditions: subject_conditions)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(@nomination_requirement)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '21')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
    end

    it do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2017')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(nil)
    end
  end

  describe '.call with multiple matching subject_conditons' do
    before do
      subject_conditions1 = [
        {
          'operator' => 'if',
          'conditions' => [
            { 'operator' => 'if', 'field' => 'YearOfJoining', 'comparator' => 'equal', 'value' => '2016' }
          ]
        }
      ]
      @nomination_requirement1 = create(:threesixty_nomination_requirement,
                                        threesixty_campaign_id: campaign.id,
                                        subject_conditions: subject_conditions1, position: 2)

      subject_conditions2 = [
        {
          'operator' => 'if',
          'conditions' => [
            { 'operator' => 'if', 'field' => 'Age', 'comparator' => 'equal', 'value' => '20' }
          ]
        }
      ]

      @nomination_requirement2 = create(:threesixty_nomination_requirement,
                                        threesixty_campaign_id: campaign.id,
                                        subject_conditions: subject_conditions2, position: 1)
    end

    it 'returns top nomination_requirement ordered by position' do
      r1 = create(:sheet_row, sheet: datasheet, email: current_user.email)
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[0], string_value: '2016')
      create(:sheet_row_datum, sheet_row: r1, sheet_column: columns[1], string_value: '20')

      expect(described_class.call!(subject.user, campaign)[subject.user_id]).to eq(@nomination_requirement2)
    end
  end
end

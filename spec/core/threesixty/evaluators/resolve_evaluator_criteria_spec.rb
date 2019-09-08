# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::ResolveEvaluatorCriteria do
  let(:user) { create(:user, email: 'user@a.com') }
  let(:subject) { create(:user, email: 'subject@a.com') }
  let(:campaign) { create(:threesixty_campaign) }
  let(:datasheet) { create(:datasheet, project_id: campaign.project.id, columns: { 'Age' => 'Number', 'No.' => 'Number' }) }

  describe '.call check conditions' do
    before do
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 21, 'No.' => 1 })
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: { 'Age' => 21, 'No.' => 2 })

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
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 21, 'No.' => 1 })
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: { 'Age' => 20, 'No.' => 2 })

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
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 21, 'No.' => 1 })
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: { 'Age' => 21, 'No.' => 2 })

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
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 21, 'No.' => 1 })
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: { 'Age' => 20, 'No.' => 2 })

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
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 21, 'No.' => 1 })
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: { 'Age' => 20, 'No.' => 2 })

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
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 21, 'No.' => 1 })
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: { 'Age' => 20, 'No.' => 2 })

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
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: { 'Age' => 20, 'No.' => 2 })

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
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 21, 'No.' => 1 })

      @criteria = [
        { 'field' => 'No.', 'value' => '2', 'comparator' => 'equal' }
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end
end

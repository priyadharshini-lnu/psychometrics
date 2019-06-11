# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::ResolveEvaluatorCriteria do
  let(:user) { create(:user, email: 'user@a.com') }
  let(:subject) { create(:user, email: 'subject@a.com') }
  let(:campaign) { create(:threesixty_campaign) }
  let(:datasheet) { create(:datasheet, project_id: campaign.project.id, columns: {'Age' => 'Number', 'No.' => 'Number'}) }

  describe '.call check conditions' do
    before do
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: {'Age' => 21, 'No.' => 1})
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: {'Age' => 21, 'No.' => 2})

      @criteria = [
        {"field"=>"No.", "value"=>"1", "operator"=>"equal"},
        {"field"=>"Age", "value"=>"21", "operator"=>"is_same_as_subject"}
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be true
    end
  end

  describe '.call check falsy condition' do
    before do
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: {'Age' => 21, 'No.' => 1})
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: {'Age' => 20, 'No.' => 2})

      @criteria = [
        {"field"=>"No.", "value"=>"1", "operator"=>"equal"},
        {"field"=>"Age", "value"=>"21", "operator"=>"is_same_as_subject"}
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be false
    end
  end


  describe '.call check single condition' do
    before do
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: {'Age' => 21, 'No.' => 1})
      create(:datasheet_row, datasheet: datasheet, email: subject.email, data: {'Age' => 20, 'No.' => 2})

      @criteria = [
        {"field"=>"No.", "value"=>"1", "operator"=>"equal"},
      ]
    end

    it do
      expect(described_class.call!(campaign, user, @criteria, subject)).to be true
    end
  end

end

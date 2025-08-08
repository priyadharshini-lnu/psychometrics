# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Threesixty::Option, type: :model do
  context 'Relations' do
    it { should belong_to(:threesixty_campaign).class_name('Threesixty::Campaign') }
  end

  context 'Default Settings' do
    let(:threesixty_campaign) { create(:threesixty_campaign) }
    let(:option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }

    it 'can be created with default participants and reports from factory' do
      expect(option).to be_persisted
      expect(option.threesixty_campaign).to eq(threesixty_campaign)
    end

    it 'has access to default participants constant' do
      expect(option.class::DEFAULT_PARTICIPANTS).to eq({
        manager: {},
        subject: { can_evaluate_self: true },
        evaluator: {},
        global: { can_not_edit_evaluation: true }
      })
    end

    it 'has access to default reports constant' do
      expect(option.class::DEFAULT_REPORTS).to eq({
        access: {},
        approval: {},
        availability: { conditions: [] }
      })
    end
  end
end

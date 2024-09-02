# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::InstructionTemplates::Load do
  let(:prev_campaign) { create(:threesixty_campaign) }
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  describe '.call' do
    it 'loads all instruction_templates for campaign' do
      template_loader = described_class.new(threesixty_campaign, nil)
      instruction_templates_attributes = [
        {
          'name' => 'subject_invite',
          'enabled' => true,
          'content' => 'Content1'
        },
        {
          'name' => 'evaluator_invite',
          'enabled' => false,
          'content' => 'Content2'
        }
      ]
      allow(template_loader).to receive(:read_yaml).and_return(instruction_templates_attributes)

      template_loader.call

      expect(threesixty_campaign.instruction_templates).to psy_have_attributes(instruction_templates_attributes)
    end

    it 'loads with prev campaign' do
      prev_campaign.instruction_templates.create!(name: 'subject_invite', enabled: true, content: 'new content')

      described_class.call!(threesixty_campaign, prev_campaign)

      expect(threesixty_campaign.instruction_templates.first.content).to eq('new content')
      expect(threesixty_campaign.instruction_templates.first.translations.count).to eq(1)
    end
  end
end

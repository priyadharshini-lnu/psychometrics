# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::InstructionTemplates::Load do
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  describe '.call' do
    it 'loads all instruction_templates for campaign' do
      template_loader = described_class.new(threesixty_campaign)
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
        },
      ]
      allow(template_loader).to receive(:read_yaml).and_return(instruction_templates_attributes)

      template_loader.call

      expect(threesixty_campaign.instruction_templates).to have_attributes(instruction_templates_attributes)
    end
  end
end

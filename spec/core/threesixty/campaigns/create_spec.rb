# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::Create do
  let(:project) { create(:project) }
  let(:form) { Threesixty::Campaigns::CreateForm.new(name: 'New campaign') }

  describe '.call' do
    it 'creates a Threesixty::Campaign record' do
      threesixty_campaign = ::Threesixty::Campaigns::Create.call!(project, form)

      expect(threesixty_campaign).to be_an_instance_of(Threesixty::Campaign)
      expect(threesixty_campaign).to be_persisted
      expect(threesixty_campaign.name).to eq(form.name)
    end

    it 'creates a Campaign record' do
      threesixty_campaign = ::Threesixty::Campaigns::Create.call!(project, form)

      expect(threesixty_campaign.campaign).to be_persisted
    end

    it 'creates a Threesixty::Option record for a Threesixty::Campaign' do
      threesixty_campaign = ::Threesixty::Campaigns::Create.call!(project, form)

      expect(threesixty_campaign.option).to be_persisted
    end

    it 'calls CreateEmptyCampaign when assessments are not passed' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(::Threesixty::Campaigns::CreateEmptyCampaign).to receive(:call!).
        and_return(threesixty_campaign)

      ::Threesixty::Campaigns::Create.call!(project, form)
    end

    it 'calls CreateFromAssessmentAndReport when assessments are passed' do
      threesixty_campaign = create(:threesixty_campaign)
      expect(::Threesixty::Campaigns::CreateFromAssessmentAndReport).to receive(:call!).
        and_return(threesixty_campaign)
      form.assessment_id = create(:assessment).id
      form.type = Threesixty::Campaign::PREVIOUS_360

      ::Threesixty::Campaigns::Create.call!(project, form)
    end
  end
end

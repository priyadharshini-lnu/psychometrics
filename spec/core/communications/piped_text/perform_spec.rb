# frozen_string_literal: true

require 'rails_helper'

describe Communications::PipedText::Perform do
  let!(:workshop) { create(:workshop, start_time: Time.zone.parse('2020-01-01T02:00 +04:00'), duration: 90.minutes) }

  describe 'Workshop pipetext' do
    it 'replaces StartTime piped text in passed date format' do
      result = described_class.call!(
        'The workshop starts at ${w://Workshop/Field/StartTime?format=%d/%m/%Y %H:%M %p %:z}.',
        workshop: workshop
      )

      expect(result).to eq('The workshop starts at 01/01/2020 02:00 AM +04:00.')
    end

    it 'replaces EndTime piped text in passed date format' do
      result = described_class.call!(
        'The workshop ends at ${w://Workshop/Field/EndTime?format=%d-%m-%Y %H:%M %p %:z}.',
        workshop: workshop
      )

      expect(result).to eq('The workshop ends at 01-01-2020 03:30 AM +04:00.')
    end

    it 'replaces Duration piped text in passed date format' do
      result = described_class.call!(
        'Duration: ${w://Workshop/Field/Duration}.',
        workshop: workshop
      )

      expect(result).to eq('Duration: 1 hour and 30 minutes.')
    end

    it do
      allow(Settings).to receive(:port).and_return(8181)
      allow(Settings).to receive(:domain).and_return('tte.test')
      user = create(:user, project: create(:project, subdomain: 'test'))
      response = described_class.call!('${c://Campaign/JoinLink?campaign_id=1&expiry=60&text=join}', user: user)
      token = Campaigns::JwtTokenizer.encode(
        { subject_id: user.id, campaign_id: '1', exp: Time.current.to_i + 60 }
      )
      expect(response).to eq("<a href='http://#{user.project.try(:subdomain)}.tte.test:8181/campaigns/join_with_token?token=#{token}' target='_blank'>join</a>") # rubocop:disable Layout/LineLength
    end
  end

  describe 'WorkshopInvite pipetext' do
    let!(:workshop_invite) { create(:workshop_invite, title: 'English title', description: 'English description') }

    before do
      Mobility.with_locale(:ar) do
        workshop_invite.update!(title: 'Arabic title', description: 'Arabic description')
      end
    end

    it 'replaces title piped text with title in passed language' do
      result = described_class.call!(
        'Title: ${wi://WorkshopInvite/Field/Title?locale=en}.',
        workshop_invite: workshop_invite
      )
      expect(result).to eq('Title: English title.')

      result = described_class.call!(
        'Title: ${wi://WorkshopInvite/Field/Title?locale=ar}.',
        workshop_invite: workshop_invite
      )
      expect(result).to eq('Title: Arabic title.')
    end

    it 'replaces description piped text with title in passed language' do
      result = described_class.call!(
        'Description: ${wi://WorkshopInvite/Field/Description?locale=en}.',
        workshop_invite: workshop_invite
      )
      expect(result).to eq('Description: English description.')

      result = described_class.call!(
        'Description: ${wi://WorkshopInvite/Field/Description?locale=ar}.',
        workshop_invite: workshop_invite
      )
      expect(result).to eq('Description: Arabic description.')
    end
  end

  describe 'Campaign piped text' do
    let!(:campaign) { create(:campaign, name: 'English Campaign Name') }

    before do
      Mobility.with_locale(:ar) do
        campaign.update!(name: 'Arabic Campaign Name')
      end
    end

    it 'replaces campaign name piped text with the name in the current locale' do
      result = I18n.with_locale(:en) do
        described_class.call!(
          'Campaign: ${c://Campaign/Field}.',
          campaign: campaign,
          user: create(:user)
        )
      end
      expect(result).to eq('Campaign: English Campaign Name.')

      result = I18n.with_locale(:ar) do
        described_class.call!(
          'Campaign: ${c://Campaign/Field}.',
          campaign: campaign,
          user: create(:user)
        )
      end
      expect(result).to eq('Campaign: Arabic Campaign Name.')
    end

    it 'replaces campaign name piped text with the name in the explicitly passed locale' do
      result = described_class.call!(
        'Campaign: ${c://Campaign/Field?locale=en}.',
        campaign: campaign,
        user: create(:user)
      )
      expect(result).to eq('Campaign: English Campaign Name.')

      result = described_class.call!(
        'Campaign: ${c://Campaign/Field?locale=ar}.',
        campaign: campaign,
        user: create(:user)
      )
      expect(result).to eq('Campaign: Arabic Campaign Name.')
    end
  end
end

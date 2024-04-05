# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::PipedText::Perform do
  describe '.call' do
    it do
      response = described_class.call!('TEXT', {})
      expect(response).to eq 'TEXT'
    end
  end
  describe '#lookup_branch' do
    it do
      response = described_class.new(nil, {}).lookup_branch('p://Link?d=Join the assessment')
      expect(response[:name]).to eq 'recipient'
    end

    it do
      response = described_class.new(nil, {}).lookup_branch('//Link?d=Join the assessment')
      expect(response).to eq nil
    end
  end
  describe '#valid_branch?' do
    it do
      response = described_class.new(nil, evaluator: 'some', threesixty_campaign: 'camp').
                 valid_branch?(required_context: %i[evaluator threesixty_campaign])
      expect(response).to eq true
    end
    it do
      response = described_class.new(nil, subject: 'some').
                 valid_branch?(required_context: %i[subject threesixty_campaign])
      expect(response).to eq false
    end
  end

  describe '.call' do
    let(:user) do
      create(:user, project: create(:project),
                        first_name: 'Vasiliy', last_name: 'Pupkin', email: 'vasja@gmail.com')
    end

    it do
      response = described_class.call!('{{u://Field/Name}} ss', user: user)
      expect(response).to match('Vasiliy Pupkin ss')
    end

    it do
      response = described_class.call!('{{dash://Url?v=444&c=de}} ss', recipient: user, threesixty_campaign: 'ddd')
      expect(response).to match(%r{/users/invitation/accept})
    end

    it do
      response = described_class.call!('{{p://Field/Name}} ss', recipient: user, threesixty_campaign: 'ddd')
      expect(response).to eq('Vasiliy Pupkin ss')
    end

    it do
      response = described_class.call!('{{e://Field/Email}} ss', evaluator: user, threesixty_campaign: 'ddd')
      expect(response).to eq('vasja@gmail.com ss')
    end

    it do
      response = described_class.call!('{{s://Field/FirstName}} ss', subject: user, threesixty_campaign: 'ddd')
      expect(response).to eq('Vasiliy ss')
    end

    it 'multiple piped text' do
      response = described_class.call!('{{s://Field/FirstName}} vs {{p://Field/Email}}',
                                       recipient: user, subject: user, threesixty_campaign: 'ddd')
      expect(response).to eq('Vasiliy vs vasja@gmail.com')
    end

    it do
      response = described_class.call!('{{d://Current?f=%-d/%-m/%Y}}', threesixty_campaign: double, subject: user)
      expect(response).to eq(Time.zone.now.strftime('%-d/%-m/%Y'))
    end

    it do
      result = double
      media_response = double
      allow(result).to receive_message_chain(:media_responses, :find_by) { media_response }
      allow(media_response).to receive_message_chain(:asset, :url) {
                                 'https://ttedev.me:3030/uploads/media_response/asset/prometeus.pdf'
                               }
      response = described_class.call!('{{answer://FileUpload/826?w=50%&h=500px}}', result: result)
      expect(response).to eq(
        '<object style="width: 50%; height: 500px; background: black; border: none;" ' \
        'data="https://ttedev.me:3030/uploads/media_response/asset/prometeus.pdf" type="application/pdf"></object>'
      )
    end

    it 'empty if error occurs' do
      response = described_class.call!('{{d://Current?f=%--}}')
      expect { response.call }.to raise_error(Exception)
      expect(response).to eq(Time.zone.now.strftime(''))
    end

    it do
      response = described_class.call!('{{d://Other/+1d?f=%-d/%-m/%Y}}', threesixty_campaign: double, subject: user)
      time = 1.day.from_now
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end

    it do
      token = ::Campaigns::JwtTokenizer.encode(
        { subject_id: user.id, campaign_id: '1', exp: Time.current.to_i + 60 }
      )

      response = described_class.call!('{{c://Campaign/JoinLink?campaign_id=1&expire=60}}', subject: user)
      expect(response).to eq("<a href='/campaigns/join_with_token?token=#{token}'>link</a>")
    end
  end
end

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
      expect(response).to eq(Time.now.strftime('%-d/%-m/%Y'))
    end

    it 'empty if error occure' do
      response = described_class.call!('{{d://Current?f=%--}}')
      expect { response.call }.to raise_error(Exception)
      expect(response).to eq(Time.now.strftime(''))
    end

    it do
      response = described_class.call!('{{d://Other/+1d?f=%-d/%-m/%Y}}', threesixty_campaign: double, subject: user)
      time = Time.now + 1.day
      expect(response).to eq(time.strftime('%-d/%-m/%Y'))
    end
  end
end

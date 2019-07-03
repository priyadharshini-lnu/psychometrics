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
      response = described_class.new(nil, evaluator: 'some', threesixty_campaign: 'camp').valid_branch?(required_context: %i[evaluator threesixty_campaign])
      expect(response).to eq true
    end
    it do
      response = described_class.new(nil, subject: 'some').valid_branch?(required_context: %i[subject threesixty_campaign])
      expect(response).to eq false
    end
  end

  describe '.call' do
    let(:user) { create(:user, project: create(:project), first_name: 'Vasiliy', last_name: 'Pupkin', email: 'vasja@gmail.com') }

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
  end
end

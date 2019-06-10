# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::CreateAllForm do
  describe '.call' do
    it 'duplicated emails' do
      form = described_class.new(subjects: [{ email: 'dev.atanov@gmail.com' }, { email: 'dev.atanov@gmail.com' }])
      form.with_context(campaign: nil)
      form.validate
      expect(form.errors.messages[:subjects].first).to include('Some subjects have the same email')
    end

    it 'invalid email' do
      form = described_class.new(subjects: [{ email: '2222' }])
      form.with_context(campaign: nil)
      form.validate
      expect(form.errors.messages[:subjects].first).to include('Email is invalid')
    end

    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:user) { create(:user, project: project, email: 'vasiliy@gmail.com') }
    before do
      create(:threesixty_subject, user: user, campaign: campaign)
    end

    it 'subject already existed' do
      form = described_class.new(subjects: [{ email: 'vasiliy@gmail.com' }])
      form.with_context(campaign: campaign)
      form.validate
      expect(form.errors.messages[:subjects].first).to include('A subject with same email already exists')
    end
  end
end

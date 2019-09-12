# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::CreateAllForm do
  let(:subject_attributes) { { first_name: 'Daniel', last_name: 'Smith', email: 'daniel@cc.com' } }

  describe '.call' do
    it 'duplicated emails' do
      form = described_class.new(subjects: [subject_attributes, subject_attributes])
      form.with_context(campaign: nil)
      form.validate
      expect(form.errors.messages[:subjects].first).to include('Some subjects have the same email')
    end

    it 'invalid email' do
      form = described_class.new(subjects: [subject_attributes.merge(email: '2222')])
      form.with_context(campaign: nil)
      form.validate
      expect(form.errors.messages[:subjects].first).to include('Email is invalid')
    end

    it 'subject already existed' do
      campaign = create(:campaign)
      user = create(:user, project: campaign.project, email: subject_attributes[:email])
      create(:threesixty_subject, user: user, campaign: campaign)

      form = described_class.new(subjects: [subject_attributes])
      form.with_context(campaign: campaign)
      form.validate
      expect(form.errors.messages[:subjects].first).to include('A subject with same email already exists')
    end

    it 'validates each subject using single_subject_form class passed' do
      form = described_class.new(subjects: [subject_attributes.merge(password: 'a')]).
             with_context(campaign: nil, single_subject_form: ::Threesixty::Subjects::ImportOneForm)
      form.validate

      expect(form.errors.messages[:subjects].first).to include('Password is too short. Minimum 6 character required')
    end
  end
end

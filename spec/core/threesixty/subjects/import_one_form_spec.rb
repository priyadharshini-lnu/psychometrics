# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::ImportOneForm do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let!(:project_job_role) { create(:job_role, name: 'Developer', project: project) }
  let!(:global_job_role) { create(:job_role, name: 'Global Role', project: nil) }

  it 'validates presence of first_name' do
    form = described_class.new(first_name: '').with_context(campaign: campaign)
    form.validate

    expect(form.errors.messages[:first_name]).to include("First name can't be blank")
  end

  it 'validates presence of last_name' do
    form = described_class.new(last_name: '').with_context(campaign: campaign)
    form.validate

    expect(form.errors.messages[:last_name]).to include("Last name can't be blank")
  end

  it 'validates presence of email' do
    form = described_class.new(email: '').with_context(campaign: campaign)
    form.validate

    expect(form.errors.messages[:email]).to include("Email can't be blank")
  end

  it 'validates email' do
    form = described_class.new(email: 'invalid').with_context(campaign: campaign)
    form.validate

    expect(form.errors.messages[:email]).to include('Email is invalid')
  end

  it 'validates locale' do
    form = described_class.new(locale: 'invalid').with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:locale]).to include('Wrong locale')
  end

  it 'rejects invalid job role names' do
    form = described_class.new(
      first_name: 'John',
      last_name: 'Doe',
      email: 'jon@example.com',
      current_job_role: 'Nonexistent Role'
    ).with_context(campaign: campaign)

    form.validate
    expect(form.errors.messages[:base]).to include(
      "Job role 'Nonexistent Role' not found in project or global roles"
    )
  end

  it 'works when no job roles are specified' do
    form = described_class.new(
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com'
    ).with_context(campaign: campaign)

    expect(form.validate).to be true
    expect(form.errors).to be_empty
  end

  it 'rejects when current and target roles are the same' do
    form = described_class.new(
      first_name: 'John',
      last_name: 'Doe',
      email: 'joh@e.cm',
      current_job_role: 'Developer',
      target_job_role: 'Developer'
    ).with_context(campaign: campaign)

    form.validate
    expect(form.errors.messages[:base]).to include(
      'Target job role must be different from current job role'
    )
  end

  describe 'UAT column' do
    def build_form(uat)
      described_class.new(
        first_name: 'John', last_name: 'Doe', email: 'john@example.com', uat: uat
      ).with_context(campaign: campaign)
    end

    it 'accepts "Yes"' do
      expect(build_form('Yes').validate).to be true
    end

    it 'accepts "No"' do
      expect(build_form('No').validate).to be true
    end

    it 'accepts a blank value' do
      expect(build_form('').validate).to be true
    end

    it 'accepts values regardless of case' do
      expect(build_form('yes').validate).to be true
      expect(build_form('NO').validate).to be true
    end

    it 'rejects a value other than Yes, No, or blank with an explicit message' do
      form = build_form('maybe')

      expect(form.validate).to be false
      expect(form.errors.messages[:uat]).to include('UAT must be one of: Yes, No, or blank')
    end
  end
end

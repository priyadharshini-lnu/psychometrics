# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::CreateOneForm do
  let(:project) { create(:project) }

  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }

  it 'invalid emails' do
    form = described_class.new(subject_email: 'accc')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:subject_email]).to include('Subject Email is invalid')
    expect(form.errors.messages[:evaluator_email]).to include('Evaluator Email is invalid')
  end

  it 'invalid relationship' do
    form = described_class.new(relationship_name: 'manager')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:relationship_name]).to include('Relationship manager is invalid')
  end

  it 'valid relationship' do
    create(:relationship, name: 'peer', type: :campaign, campaign: campaign)
    create(:threesixty_subject, user: create(:user, email: 'aa@a.com', project_id: campaign.project_id),
           campaign: campaign)
    form = described_class.new(
      subject_email: 'aa@a.com',
      evaluator_email: 'b@b.com',
      evaluator_first_name: 'John',
      evaluator_last_name: 'Smith',
      relationship_name: 'peer'
    )
    form.with_context(campaign: campaign)
    form.valid?
    expect(form.valid?).to eq(true)
  end

  it 'already existing subject+evaluator connection' do
    create(:threesixty_participant, campaign: campaign, subject_id: create(:user, email: 'a@a.com'),
           evaluator_id: create(:user, email: 'b@b.com'))
    form = described_class.new(subject_email: 'a@a.com', evaluator_email: 'b@b.com')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:evaluator_email]).to include('The subject with this evaluator are already connected')
  end

  it 'password smaller than 6 chars are invalid' do
    form = described_class.new(evaluator_password: 'week').with_context(campaign: campaign)
    form.validate

    expect(form.errors.messages[:evaluator_password]).to include('is too short (minimum is 6 characters)')
  end

  it 'password can be blank' do
    form = described_class.new(evaluator_password: '').with_context(campaign: campaign)
    form.validate

    expect(form.errors.messages[:evaluator_password]).to be_empty
  end

  it 'valid password' do
    form = described_class.new(evaluator_password: 'strong_password').with_context(campaign: campaign)
    form.validate

    expect(form.errors.messages[:evaluator_password]).to be_empty
  end
end

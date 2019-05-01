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

  before do
    create(:relationship, name: 'manager', type: :campaign)
  end
  it 'invalid relationship' do
    form = described_class.new(relationship_name: 'manager')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:relationship_name]).to include('Relationship is invalid')
  end

  before do
    create(:participant, subject_id: create(:user, email: 'a@a.com'), evaluator_id: create(:user, email: 'b@b.com'))
  end

  it 'existing subject+evaluator connection' do
    form = described_class.new(subject_email: 'a@a.com', evaluator_email: 'b@b.com')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:evaluator_email]).to include('The subject with this evaluator are already connected')
  end

  before do
    create(:relationship, name: 'peer', type: :campaign, campaign: campaign)
  end

  it 'valid' do
    form = described_class.new(subject_email: 'aa@a.com', evaluator_email: 'b@b.com', relationship_name: 'peer')
    form.with_context(campaign: campaign)
    form.valid?
    expect(form.valid?).to eq(true)
  end
end

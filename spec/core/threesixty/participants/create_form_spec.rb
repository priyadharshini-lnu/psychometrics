# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::CreateForm do
  let(:project) { create(:project) }

  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }

  let (:subject) { create(:threesixty_subject, campaign: campaign)}
  let (:evaluator) { create(:threesixty_evaluator, campaign: campaign)}
  let (:relationship) { create(:relationship, name: 'manager', type: :campaign) }

  it 'invalid user' do
    form = described_class.new(evaluator_id: nil)
    form.with_context(subject: subject, evaluator: evaluator)
    form.validate
    expect(form.errors.messages[:relationship_id]).to include('can\'t be blank')
  end

  it 'invalid relationship' do
    form = described_class.new(relationship_name: 'manager')
    form.with_context(subject: subject, evaluator: evaluator)
    form.validate
    expect(form.errors.messages[:relationship_id]).to include('can\'t be blank')
  end

  it 'valid' do
    form = described_class.new(evaluator_email: 'test@a.com', relationship_id: relationship.id)
    form.with_context(subject: subject, evaluator: evaluator)
    expect(form.valid?).to eq(true)
  end

  context 'existsing validation' do
    before do
      create(:participant, campaign: campaign, evaluator_id: evaluator.user_id, subject_id: subject.user_id)
    end

    it 'validate' do
      form = described_class.new(evaluator_email: 'test@a.com', relationship_id: relationship.id)
      form.with_context(subject: subject, evaluator: evaluator)
      form.validate
      expect(form.errors.messages[:evaluator]).to include('already exists')
    end
  end
end

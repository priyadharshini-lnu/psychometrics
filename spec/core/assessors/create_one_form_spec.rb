# frozen_string_literal: true

require 'rails_helper'

describe Assessors::CreateOneForm do
  let(:project) { create(:project) }

  let(:campaign) { create(:campaign, project: project) }

  it 'invalid emails' do
    form = described_class.new(subject_email: 'accc')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:subject_email]).to include('Subject Email is invalid')
    expect(form.errors.messages[:assessor_email]).to include('Assessor Email is invalid')
  end

  it 'already existing subject+assessor connection' do
    relationship = create(:relationship, name: Relationship::ASSESSOR)
    create(:user_assessment, campaign: campaign, subject_id: create(:user, email: 'a@a.com'),
           evaluator_id: create(:user, email: 'b@b.com'), relationship: relationship)
    form = described_class.new(subject_email: 'a@a.com', evaluator_email: 'b@b.com')
    form.with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:assessor_email]).to include('The subject with this assessor are already connected')
  end
end

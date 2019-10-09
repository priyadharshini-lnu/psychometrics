# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::CreateForm do
  let(:campaign) { create(:threesixty_campaign) }
  let(:option) { create(:threesixty_option, threesixty_campaign: campaign) }
  let(:datasheet) do
    create(:datasheet, project_id: campaign.project.id,
                           columns: { 'Age' => 'Number', 'No.' => 'Number' })
  end

  let(:user) { create(:user, email: 'exists@a.com', project: campaign.project) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign) }
  let(:peer) { create(:relationship, name: 'Peer', type: :campaign) }

  before do
    campaign.option = option
  end

  # it 'invalid user' do
  #   form = described_class.new(evaluator_id: nil)
  #   form.with_context(subject: subject, threesixty_campaign: campaign)
  #   form.validate
  #   expect(form.errors.messages[:relationship_id]).to include('can\'t be blank')
  # end

  # it 'invalid relationship' do
  #   form = described_class.new(relationship_name: 'manager')
  #   form.with_context(subject: subject, evaluator: evaluator)
  #   form.validate
  #   expect(form.errors.messages[:relationship_id]).to include('can\'t be blank')
  # end

  # it 'valid' do
  #   form = described_class.new(evaluator_email: 'test@a.com', relationship_id: relationship.id)
  #   form.with_context(subject: subject, evaluator: evaluator)
  #   expect(form.valid?).to eq(true)
  # end

  # context 'existsing validation' do
  #   before do
  #     create(:participant, campaign: campaign, evaluator_id: evaluator.user_id, subject_id: subject.user_id)
  #   end

  #   it 'validate' do
  #     form = described_class.new(evaluator_email: 'test@a.com', relationship_id: relationship.id)
  #     form.with_context(subject: subject, evaluator: evaluator)
  #     form.validate
  #     expect(form.errors.messages[:evaluator]).to include('already exists')
  #   end
  # end

  describe 'check with enabled anyone option' do
    before do
      campaign.option.participants = { 'subject': { 'can_nominate_anyone_not_in_assessment': true } }
      @params = {
        evaluator_email: 'unexists@a.com',
        relationship_id: peer.id,
        first_name: 'first_name',
        last_name: 'last_name'
      }
    end

    it 'should be valid with valid params' do
      form = described_class.from_params(@params).with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be true
      expect(form.user).to be nil
    end

    it 'should be valid with valid params' do
      form = described_class.from_params({}).with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
      expect(form.errors.messages[:evaluator_email]).to include("can't be blank")
      expect(form.errors.messages[:relationship_id]).to include("can't be blank")
      expect(form.user).to be nil
    end

    it 'should be invalid by uniquesness for existed user' do
      create(:threesixty_participant, campaign: campaign.campaign, evaluator_id: user.id, subject_id: subject.user_id)
      form = described_class.from_params(
        evaluator_email: user.email,
        relationship_id: peer.id
      ).with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
      expect(form.user).to eq(user)
      expect(form.errors.messages[:evaluator]).to include('already exists')
    end
  end

  describe 'with validating from datasheet' do
    before do
      campaign.option.participants = { 'subject': {
        'can_nominate_anyone_from_datasheet': true,
        'limit_nomination_by_subject_from_datasheet': true,
        'limit_nomination_by_subject_from_datasheet_criteria': [
          { 'field' => 'Age', 'value' => '55', 'comparator' => 'equal' }
        ]
      } }
      create(:datasheet_row, datasheet: datasheet, email: subject.user.email, data: { 'Age' => 21, 'No.' => 2 })
    end

    it 'should returns error without datasheet' do
      form = described_class.from_params(evaluator_email: 'unexists@a.com', relationship_id: peer.id).
             with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
      expect(form.errors.messages[:evaluator]).to include('can not be processed')
      expect(form.user).to be nil
    end

    it 'should returns error with falsy criteria' do
      create(:datasheet_row, datasheet: datasheet, email: 'unexists@a.com', data: { 'Age' => 21, 'No.' => 1 })
      form = described_class.from_params(evaluator_email: 'unexists@a.com', relationship_id: peer.id).
             with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
      expect(form.errors.messages[:evaluator]).to include('can not be processed')
      expect(form.user).to be nil
    end

    it 'should be valid without conditions' do
      campaign.option.participants = { 'subject': {
        'can_nominate_anyone_from_datasheet': true,
        'limit_nomination_by_subject_from_datasheet': false
      } }
      create(:datasheet_row, datasheet: datasheet, email: 'unexists@a.com', data: { 'Age' => 21, 'No.' => 1 })
      form = described_class.from_params(evaluator_email: 'unexists@a.com', relationship_id: peer.id,
                                         first_name: 'first_name', last_name: 'last_name').
             with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be true
      expect(form.user).to be nil
    end

    it 'should be valid with truly criteria' do
      create(:datasheet_row, datasheet: datasheet, email: 'unexists@a.com', data: { 'Age' => 55, 'No.' => 1 })
      form = described_class.from_params(evaluator_email: 'unexists@a.com', relationship_id: peer.id,
                                         first_name: 'first_name', last_name: 'last_name').
             with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be true
      expect(form.user).to be nil
    end

    it 'should be valid and returns existed user' do
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 55, 'No.' => 1 })
      form = described_class.from_params(evaluator_email: user.email, relationship_id: peer.id).
             with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be true
      expect(form.user).to eq(user)
    end

    it 'should be invalid by uniquesness for existed user' do
      create(:datasheet_row, datasheet: datasheet, email: user.email, data: { 'Age' => 55, 'No.' => 1 })
      create(:threesixty_participant, campaign: campaign.campaign, evaluator_id: user.id, subject_id: subject.user_id)
      form = described_class.from_params(evaluator_email: user.email, relationship_id: peer.id).
             with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
      expect(form.user).to eq(user)
      expect(form.errors.messages[:evaluator]).to include('already exists')
    end
  end

  describe 'check with disabled anyone option' do
    before do
      campaign.option.participants = { 'subject': { 'can_nominate_anyone_not_in_assessment': false } }
    end

    it 'should be invalid for unexisted user' do
      params = { evaluator_email: 'unexists@a.com', relationship_id: peer.id }
      form = described_class.from_params(params).with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
    end

    it 'should be valid for existed user' do
      params = { evaluator_email: user.email, relationship_id: peer.id }
      form = described_class.from_params(params).with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be true
      expect(form.user).to eq(user)
    end

    it 'should be invalid for existed user with invalid realtionship' do
      params = { evaluator_email: user.email }
      form = described_class.from_params(params).with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
      expect(form.errors.messages[:relationship_id]).to include("can't be blank")
      expect(form.user).to eq(user)
    end

    it 'should be invalid for existed user with invalid email' do
      params = { relationship_id: peer.id }
      form = described_class.from_params(params).with_context(threesixty_campaign: campaign, subject: subject)
      expect(form.valid?).to be false
      expect(form.errors.messages[:evaluator_email]).to include("can't be blank")
      expect(form.user).to be nil
    end
  end
end

# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::NominationRequirements::SaveAll do
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  it 'creates new nomination_requirements' do
    attributes1 = {
      name: 'Requirement1',
      position: 1,
      conditions: [
        { comparator: 'atleast', relationship_id: 2 }
      ],
      subject_conditions: [
        { operator: 'if', conditions: [{ comparator: 'equal', field: 'Gender', value: 'Male' }] }
      ]
    }
    attributes2 = { name: 'Requirement2', conditions: [], subject_conditions: [], position: 2 }
    form = Threesixty::NominationRequirements::SaveAllForm.from_params(nomination_requirements: [attributes1, attributes2])
    described_class.call!(threesixty_campaign, form)

    expected_attributes = nomination_requirement_attributes(threesixty_campaign.reload.nomination_requirements.first)
    expect(expected_attributes).to eq(attributes1)

    expected_attributes = nomination_requirement_attributes(threesixty_campaign.reload.nomination_requirements.last)
    expect(expected_attributes).to eq(attributes2)
  end

  it 'updates existing nomination requirement' do
    nomination_requirements = create_list(:threesixty_nomination_requirement, 2, threesixty_campaign_id: threesixty_campaign.id)
    attributes1 = {
      id: nomination_requirements.first.id,
      name: 'Requirement1',
      position: 1,
      conditions: [
        { comparator: 'atleast', relationship_id: 2 }
      ],
      subject_conditions: [
        { operator: 'if', conditions: [{ comparator: 'equal', field: 'Gender', value: 'Male' }] }
      ]
    }

    attributes2 = {
      id: nomination_requirements.last.id,
      name: 'Requirement2',
      conditions: [],
      subject_conditions: [],
      position: 2
    }

    form = Threesixty::NominationRequirements::SaveAllForm.from_params(nomination_requirements: [attributes1, attributes2])
    described_class.call!(threesixty_campaign, form)

    expected_attributes = nomination_requirement_attributes(nomination_requirements.first.reload)
    expect(expected_attributes).to eq(attributes1.except(:id))

    expected_attributes = nomination_requirement_attributes(nomination_requirements.last.reload)
    expect(expected_attributes).to eq(attributes2.except(:id))
  end

  it 'deletes nomination_requirement that is not passed' do
    nomination_requirements = create_list(:threesixty_nomination_requirement, 2, threesixty_campaign_id: threesixty_campaign.id)
    attributes = {
      id: nomination_requirements.first.id,
      name: 'Requirement1',
      position: 1,
      conditions: [],
      subject_conditions: []
    }

    form = Threesixty::NominationRequirements::SaveAllForm.from_params(nomination_requirements: [attributes])
    described_class.call!(threesixty_campaign, form)

    expect(Threesixty::NominationRequirement.find_by(id: nomination_requirements.last.id)).to be_nil
  end

  private

  def nomination_requirement_attributes(nomination_requirement)
    nomination_requirement.
      attributes.
      deep_symbolize_keys.
      slice(:name, :position, :conditions, :subject_conditions)
  end
end

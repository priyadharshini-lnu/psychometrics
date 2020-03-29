# frozen_string_literal: true

require 'rails_helper'

describe Assigns::SaveAgileEvent do
  let(:assign) { create(:assign) }

  it 'creates agile_events record' do
    form = Assigns::AgileEventForm.new
    agile_event = Assigns::SaveAgileEvent.call!(assign, form)

    expect(agile_event).to be_persisted
  end

  it "updates completed_group in assign for 'endGroup' event" do
    form = Assigns::AgileEventForm.new(event: 'endGroup', data: { 'id' => 'group_id1' })
    Assigns::SaveAgileEvent.call!(assign, form)

    expect(assign.meta_data).to eq('completed_groups' => ['group_id1'])

    form = Assigns::AgileEventForm.new(event: 'endGroup', data: { 'id' => 'group_id2' })
    Assigns::SaveAgileEvent.call!(assign, form)

    expect(assign.meta_data).to eq('completed_groups' => %w[group_id1 group_id2])
  end

  it "marks assign as completed for 'assessmentComplete' event" do
    form = Assigns::AgileEventForm.new(event: 'assessmentComplete')
    Assigns::SaveAgileEvent.call!(assign, form)

    expect(assign.completed?).to eq true
    expect(assign.completed_at).to be_present
  end
end

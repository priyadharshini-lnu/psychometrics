# frozen_string_literal: true

require 'rails_helper'

describe Assigns::SaveGameEvent do
  let(:assign) { create(:assign) }

  it 'creates game_events record' do
    form = Assigns::GameEventForm.new
    game_event = Assigns::SaveGameEvent.call!(assign, form)

    expect(game_event).to be_persisted
  end

  it "updates completed_group in assign for 'endGroup' event" do
    form = Assigns::GameEventForm.new(event: 'endGroup', data: { 'id' => 'group_id1' })
    Assigns::SaveGameEvent.call!(assign, form)

    expect(assign.meta_data).to eq('completed_groups' => ['group_id1'])

    form = Assigns::GameEventForm.new(event: 'endGroup', data: { 'id' => 'group_id2' })
    Assigns::SaveGameEvent.call!(assign, form)

    expect(assign.meta_data).to eq('completed_groups' => %w[group_id1 group_id2])
  end

  it "marks assign as completed for 'assessmentComplete' event" do
    form = Assigns::GameEventForm.new(event: 'assessmentComplete')
    Assigns::SaveGameEvent.call!(assign, form)

    expect(assign.completed?).to eq true
    expect(assign.completed_at).to be_present
  end
end

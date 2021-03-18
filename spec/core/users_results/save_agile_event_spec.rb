# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::SaveAgileEvent do
  let(:users_result) { create(:users_result) }

  it 'creates agile_events record' do
    form = UsersResults::AgileEventForm.new
    user = double('User')
    agile_event = UsersResults::SaveAgileEvent.call!(users_result, form, user)

    expect(agile_event).to be_persisted
  end

  it "updates completed_group in users_result for 'endGroup' event" do
    form = UsersResults::AgileEventForm.new(event: 'endGroup', data: { id: 'group_id1' })
    user = double('User')
    UsersResults::SaveAgileEvent.call!(users_result, form, user)

    expect(users_result.meta_data).to eq('completed_groups' => ['group_id1'])

    form = UsersResults::AgileEventForm.new(event: 'endGroup', data: { id: 'group_id2' })
    user = double('User')
    UsersResults::SaveAgileEvent.call!(users_result, form, user)

    expect(users_result.meta_data).to eq('completed_groups' => %w[group_id1 group_id2])
  end

  it "marks users_result as completed for 'assessmentComplete' event" do
    form = UsersResults::AgileEventForm.new(event: 'assessmentComplete')
    user = create(:user)
    UsersResults::SaveAgileEvent.call!(users_result, form, user)

    expect(users_result.completed?).to eq true
    expect(users_result.completed_at).to be_present
  end
end

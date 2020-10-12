# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::SaveAgileData do
  let(:users_result) { create(:users_result) }

  it 'save group_id and answers in results column' do
    form = UsersResults::AgileForm.new(group_id: 'group_id', answers: { id1: { answers: ['+'] } })
    UsersResults::SaveAgileData.call!(users_result, form)

    expect(users_result.answers).to eq([{ 'group_id' => 'group_id', 'answers' => { 'id1' => { 'answers' => ['+'] } } }])
  end

  it 'updates completed_group in users_result' do
    form = UsersResults::AgileForm.new(group_id: 'group_id', answers: {})
    UsersResults::SaveAgileData.call!(users_result, form)

    expect(users_result.meta_data).to eq('completed_groups' => ['group_id'])
  end
end

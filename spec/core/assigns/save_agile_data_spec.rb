# frozen_string_literal: true

require 'rails_helper'

describe Assigns::SaveAgileData do
  let(:assign) { create(:assign) }

  it 'save group_id and answers in results column' do
    form = Assigns::AgileForm.new(group_id: 'group_id', answers: { id1: { answers: ['+'] } })
    Assigns::SaveAgileData.call!(assign, form)

    expect(assign.results).to eq([{ 'group_id' => 'group_id', 'answers' => { 'id1' => { 'answers' => ['+'] } } }])
  end

  it 'updates completed_group in assign' do
    form = Assigns::AgileForm.new(group_id: 'group_id', answers: {})
    Assigns::SaveAgileData.call!(assign, form)

    expect(assign.meta_data).to eq('completed_groups' => ['group_id'])
  end
end

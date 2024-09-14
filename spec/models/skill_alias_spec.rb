# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SkillAlias, type: :model do
  it { should belong_to(:client) }
  it { should belong_to(:skill) }

  it 'has a valid factory' do
    expect(build(:skill_alias)).to be_valid
  end
end

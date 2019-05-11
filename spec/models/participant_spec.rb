require 'rails_helper'

RSpec.describe Participant, type: :model do
  it { should belong_to(:subject).class_name('User') }
  it { should belong_to(:evaluator).class_name('User') }
  it { should belong_to(:project).class_name('Client') }
  it { should belong_to(:campaign) }
  it { should belong_to(:relationship) }

  it { should define_enum_for(:manager_status).with_values(waiting: 0, approved: 1, denied: 2) }
  it { should define_enum_for(:evaluator_status).with_values(waiting: 0, approved: 1, denied: 2) }
end
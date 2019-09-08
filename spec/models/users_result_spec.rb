# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersResult, type: :model do
  it { should belong_to(:subject).class_name('User') }
  it { should belong_to(:evaluator).class_name('User') }
  it { should belong_to(:assessment) }

  it { should define_enum_for(:status).with_values(not_started: 0, in_progress: 1, completed: 2) }
end

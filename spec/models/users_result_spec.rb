# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersResult, type: :model do
  it {
    should define_enum_for(:status).
      with_values(not_started: 0, in_progress: 1, completed: 2, interrupted: 3, timed_out: 4, ineligible: 5)
  }
end

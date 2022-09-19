# frozen_string_literal: true

require 'rails_helper'

describe Sheet, type: :model do
  it { should belong_to(:project).class_name('Client') }
  it { should have_many(:rows).class_name('SheetRow').inverse_of(:sheet).dependent(:destroy) }
end

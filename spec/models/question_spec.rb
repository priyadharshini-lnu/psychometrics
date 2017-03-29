# == Schema Information
#
# Table name: questions
#
#  id                  :integer          not null, primary key
#  name                :string
#  position            :integer
#  type                :string
#  props               :json
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  block_id            :integer
#  deleted_at          :datetime
#  required_validation :json
#  validation          :json
#  display_logic       :json
#  skip_logic          :json
#  view                :integer          default("assessments")
#  disabled            :boolean          default(FALSE)
#  template_id         :integer
#  assessment_id       :integer
#  owner_id            :integer
#

require 'rails_helper'

RSpec.describe Question, type: :model do
  context 'Question center methods' do
    it 'dup_for_assessment' do
    end
  end
end

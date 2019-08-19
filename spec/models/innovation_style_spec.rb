# == Schema Information
#
# Table name: innovation_styles
#
#  id          :bigint(8)        not null, primary key
#  name        :string
#  icon        :string
#  description :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

require 'rails_helper'

RSpec.describe InnovationStyle, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end

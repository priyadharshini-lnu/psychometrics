# frozen_string_literal: true

# == Schema Information
#
# Table name: reports_modules
#
#  id         :integer          not null, primary key
#  page_id    :integer
#  name       :string
#  props      :json
#  position   :integer
#  deleted_at :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  type       :string
#

module Reports
  class Module < ApplicationRecord
    include Copyable

    belongs_to :page, class_name: 'Reports::Page', touch: true
    belongs_to :assessment
    has_many :translations, as: :translateable, dependent: :destroy

    acts_as_list scope: :page_id

    validates :page, presence: true

    # Disables single column inheritance
    self.inheritance_column = :_type_disabled

    def self.table_name_prefix
      'reports_'
    end
  end
end

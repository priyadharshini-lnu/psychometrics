class Reports::Module < ApplicationRecord
  belongs_to :page, class_name: 'Reports::Page'
  acts_as_list scope: :page_id

  #
  # Disables single column inheritance
  #
  self.inheritance_column = :_type_disabled

  def self.table_name_prefix
    'reports_'
  end
end

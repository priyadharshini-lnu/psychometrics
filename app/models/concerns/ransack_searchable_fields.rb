# frozen_string_literal: true

module RansackSearchableFields
  extend ActiveSupport::Concern

  included do
    scope :eq_id_or_cont_name, lambda { |search_term|
      where("#{table_name}.id=#{search_term.to_i} OR name LIKE '%#{search_term}%'")
    }
  end

  class_methods do
    def ransackable_scopes(_auth_object = nil)
      # returns an array of whitelisted scopes that can be used by ransack gem
      %i[eq_id_or_cont_name]
    end
  end
end

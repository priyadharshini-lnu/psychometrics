# frozen_string_literal: true

module RansackSearchableFields
  extend ActiveSupport::Concern

  included do
    scope :filterable_fields, lambda { |search_term|
      search_term = search_term.to_s
      if (search_term !~ /\D/) && search_term.present?
        where("#{table_name}.id = ? OR #{table_name}.name ILIKE ? ", search_term, "%#{search_term}%")
      else
        where("#{table_name}.name ILIKE ?", "%#{search_term}%")
      end
    }
  end

  class_methods do
    def ransackable_scopes(_auth_object = nil)
      # returns an array of whitelisted scopes that can be used by ransack gem
      %i[filterable_fields]
    end
  end
end

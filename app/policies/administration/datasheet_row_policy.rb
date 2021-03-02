# frozen_string_literal: true

module Administration
  class DatasheetRowPolicy < Administration::BasePolicy
    def bulk_delete?
      create?
    end

    def save_column_preference?
      create?
    end

    def import?
      create?
    end

    def export?
      create?
    end
  end
end

# frozen_string_literal: true

module Reports
  class DraftReader < BaseReader
    delegate(*SNAPSHOTTED_READERS, to: :report)
  end
end

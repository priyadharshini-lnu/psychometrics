# frozen_string_literal: true

module Reports
  # Report can be either read as draft or as published. This class is the interface both of them answer.
  class BaseReader
    include Reports::DataConfigurationDerived

    # Metadata that is not part of the design, so it is never snapshotted and reads the
    # same whichever version was asked for.
    UNSNAPSHOTTED_READERS = %i[
      id name description disabled category category_threesixty?
      assessment_ids assessments dimension_ids factors_aliases
      created_at updated_at default_language other_languages
      published_snapshot decorate icon poster data_only?
    ].freeze

    # The design itself, which is what diverges between the draft and the snapshot.
    SNAPSHOTTED_READERS = %i[
      props styles data_configuration data_sheet_columns external_settings
      pages filters campaign_factors campaign_ai_artifacts modules_empty?
      translation_scope
    ].freeze

    delegate(*UNSNAPSHOTTED_READERS, to: :report)

    SNAPSHOTTED_READERS.each do |reader|
      define_method(reader) do
        raise NotImplementedError, "#{self.class} must implement ##{reader}"
      end
    end

    attr_reader :report

    def initialize(report)
      @report = report
    end

    def self.interface
      UNSNAPSHOTTED_READERS + SNAPSHOTTED_READERS + Reports::DataConfigurationDerived.instance_methods
    end
  end
end

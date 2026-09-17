# frozen_string_literal: true

module Projects
  # Example:
  #   campaign_groups = [
  #     { campaign_name: 'Cohort A', file_entries: [..., ...] },  # 1500 files
  #     { campaign_name: 'Cohort B', file_entries: [...] }         # 500 files
  #   ]
  #
  #   # => [
  #   #   [{ campaign_name: 'Cohort A', file_entries: [...] }],  # 999 files
  #   #   [{ campaign_name: 'Cohort A', file_entries: [...] }, ...],  # 999 files
  #   #   [{ campaign_name: 'Cohort A', file_entries: [...] }, { campaign_name: 'Cohort B', ... }]
  #   # ]
  class BulkDownloadBatcher
    MAX_FILES_PER_BATCH = 999
    private_attr_reader :campaign_groups

    def initialize(campaign_groups)
      @campaign_groups = campaign_groups
    end

    def batch
      sub_groups = split_large_campaigns

      pack_into_batches(sub_groups)
    end

    private

    def split_large_campaigns
      campaign_groups.flat_map do |group|
        entries = group[:file_entries]

        if entries.length > MAX_FILES_PER_BATCH
          entries.each_slice(MAX_FILES_PER_BATCH).map do |slice|
            { campaign_name: group[:campaign_name], file_entries: slice }
          end
        else
          [group]
        end
      end
    end

    def pack_into_batches(sub_groups)
      batches = []
      current_batch = []
      current_count = 0

      sub_groups.each do |group|
        group_size = group[:file_entries].length

        if current_batch.any? && current_count + group_size > MAX_FILES_PER_BATCH
          batches << current_batch
          current_batch = []
          current_count = 0
        end

        current_batch << group
        current_count += group_size
      end

      batches << current_batch unless current_batch.empty?
      batches
    end
  end
end

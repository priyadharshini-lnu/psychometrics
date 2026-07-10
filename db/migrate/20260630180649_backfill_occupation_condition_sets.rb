# frozen_string_literal: true

# rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations

class BackfillOccupationConditionSets < ActiveRecord::Migration[7.1]
  class MigrationDimension < ActiveRecord::Base
    self.table_name = 'dimensions'
  end

  class MigrationOccupation < ActiveRecord::Base
    self.table_name = 'occupations'
  end

  class MigrationOccupationsFactor < ActiveRecord::Base
    self.table_name = 'occupations_factors'
  end

  class MigrationOccupationConditionSet < ActiveRecord::Base
    self.table_name = 'occupation_condition_sets'
  end

  class MigrationAssessment < ActiveRecord::Base
    self.table_name = 'assessments'
  end

  class MigrationCampaignAssessment < ActiveRecord::Base
    self.table_name = 'campaign_assessments'
  end

  class MigrationUserAssessment < ActiveRecord::Base
    self.table_name = 'user_assessments'
  end

  class MigrationUsersResult < ActiveRecord::Base
    self.table_name = 'users_results'
  end

  def up
    legacy_dimension_ids = MigrationOccupation.
                           joins(
                             'INNER JOIN occupations_factors ON occupations_factors.occupation_id = occupations.id'
                           ).
                           select(:dimension_id).
                           distinct

    dimensions_to_backfill = MigrationDimension.
                             where(occupations_enabled: true).
                             or(MigrationDimension.where(id: legacy_dimension_ids))

    dimensions_to_backfill.in_batches(of: 50) do |relation|
      tenant_id_by_dim = relation.pluck(:id, :tenant_id).to_h
      ActiveRecord::Base.transaction do
        relation.pluck(:id).each do |dim_id|
          set = MigrationOccupationConditionSet.find_by(dimension_id: dim_id, name: 'Default') ||
                MigrationOccupationConditionSet.create!(
                  name: 'Default',
                  dimension_id: dim_id,
                  tenant_id: tenant_id_by_dim[dim_id],
                  created_at: Time.current,
                  updated_at: Time.current
                )
          stamp_records(dim_id, set.id)
        end
      end
    end

    cleanup_unmappable_occupations_factors!
  end

  def down
    # Delete non-default occupations_factors to avoid duplicates upon rollback causing score inflation
    default_set_ids = MigrationDimension.where.
                      not(default_occupation_condition_set_id: nil).
                      pluck(:default_occupation_condition_set_id)
    if default_set_ids.any?
      MigrationOccupationsFactor.where.not(occupation_condition_set_id: default_set_ids).delete_all
    end

    MigrationDimension.update_all(default_occupation_condition_set_id: nil)
    MigrationOccupationsFactor.update_all(occupation_condition_set_id: nil)
    MigrationCampaignAssessment.update_all(occupation_condition_set_id: nil)
    MigrationUsersResult.update_all(occupation_condition_set_id: nil)
    MigrationOccupationConditionSet.delete_all
  end

  private

  def cleanup_unmappable_occupations_factors!
    # Rows with missing occupation or missing dimension cannot be backfilled safely.
    MigrationOccupationsFactor.joins(
      'LEFT JOIN occupations ON occupations.id = occupations_factors.occupation_id'
    ).where(occupation_condition_set_id: nil).
      where('occupations.id IS NULL OR occupations.dimension_id IS NULL').
      delete_all
  end

  def stamp_records(dim_id, set_id)
    MigrationDimension.where(id: dim_id).update_all(default_occupation_condition_set_id: set_id)

    occ_ids = MigrationOccupation.where(dimension_id: dim_id).select(:id)
    MigrationOccupationsFactor.where(occupation_id: occ_ids).update_all(occupation_condition_set_id: set_id)

    assessment_ids = MigrationAssessment.where(dimension_id: dim_id).select(:id)
    MigrationCampaignAssessment.where(assessment_id: assessment_ids).
      update_all(occupation_condition_set_id: set_id)

    users_result_ids = MigrationUserAssessment.
                       where(assessment_id: assessment_ids).
                       where.not(users_result_id: nil).
                       select(:users_result_id)
    MigrationUsersResult.where(id: users_result_ids).update_all(occupation_condition_set_id: set_id)
  end
end
# rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations

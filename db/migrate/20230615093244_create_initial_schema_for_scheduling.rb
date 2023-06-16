# frozen_string_literal: true

class CreateInitialSchemaForScheduling < ActiveRecord::Migration[6.1]
  def change
    create_table :workshops do |t|
      t.references :campaign, foreign_key: { on_delete: :cascade }
      t.datetime :start_time, null: false
      t.string :timezone, null: false
      t.integer :duration, null: false
      t.integer :video_call_type, default: 0, null: false
      t.text :meeting_link
      t.integer :total_seats, default: 0, null: false
      t.integer :booked_seats, default: 0, null: false
      t.integer :cancellation_lead_time, default: 0
      t.integer :reschedule_lead_time, default: 0
      t.json :resources, default: []
      t.timestamps null: false
    end

    create_table :workshop_invites do |t|
      t.string :title
      t.string :description
      t.boolean :allow_language_preference, default: false, null: false
      t.jsonb :allowed_languages, default: []
      t.boolean :allow_neurodiversity_option, default: false, null: false
      t.timestamps null: false
    end

    create_table :workshop_invites_workshops do |t|
      t.references :workshop, foreign_key: { on_delete: :cascade }
      t.references :workshop_invite, foreign_key: { on_delete: :cascade }
    end

    create_table :workshop_invite_translations do |t|
      t.string :title
      t.string :description
      t.string :locale, null: false
      t.references :workshop_invite, null: false, foreign_key: true, index: false
      t.timestamps null: false
    end

    add_index :workshop_invite_translations, :locale, name: :index_workshop_invite_translations_on_locale
    add_index :workshop_invite_translations, %i[workshop_invite_id locale],
              name: :index_57aa4720fb18a9d3160720802166a1fa6020dfdf, unique: true
    add_index :workshop_invite_translations, %i[title locale],
              name: :index_workshop_invite_translations_on_title_and_locale
    add_index :workshop_invite_translations, %i[description locale],
              name: :index_workshop_invite_translations_on_description_and_locale

    create_table :workshop_invited_subjects do |t|
      t.references :workshop_invite, foreign_key: { on_delete: :cascade }
      t.references :user, foreign_key: { on_delete: :cascade }
      t.integer :status, default: 0, null: false # pending, accepted, cancelled, requested_cancellation, requested_rescheduling, :rescheduled
      t.text :reason
      t.timestamps null: false
    end

    create_table :workshop_invite_logs do |t|
      t.references :workshop, foreign_key: { on_delete: :cascade }
      t.references :user, foreign_key: { on_delete: :cascade }
      t.references :created_by, foreign_key: { to_table: :users, on_delete: :cascade }
      t.string :action # accepted, cancelled, :requested_cancellation, :requested_rescheduling, rescheduled
      t.json :details
      t.timestamps null: false
    end

    create_table :workshop_subjects do |t|
      t.references :workshop, foreign_key: { on_delete: :cascade }
      t.references :user, foreign_key: { on_delete: :cascade }
      t.boolean :attended, default: false, null: false
      t.integer :status, default: 0, null: false # not_started, late, no_show, completed, dropped_out
      t.string :status_remarks
      t.integer :late_duration
      t.timestamps null: false
    end

    create_table :workshop_assessors do |t|
      t.references :workshop, foreign_key: { on_delete: :cascade }
      t.references :user, foreign_key: { on_delete: :cascade }
      t.timestamps null: false
    end

    create_table :workshop_managers do |t|
      t.references :workshop, foreign_key: { on_delete: :cascade }
      t.references :user, foreign_key: { on_delete: :cascade }
      t.timestamps null: false
    end

    create_table :user_availability_dates do |t|
      t.references :user, foreign_key: { on_delete: :cascade }
      t.string :timezone, null: false
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.timestamps null: false
    end

    create_table :user_availability_days do |t|
      t.references :user_availability_date, foreign_key: { on_delete: :cascade }
      t.integer :day, null: false, default: 1 # 1-7 for each day (Sunday to Saturday)
      t.time :start_time, null: false
      t.time :end_time,  null: false
      t.timestamps null: false
    end

    create_table :user_bookings do |t|
      t.references :user, foreign_key: { on_delete: :cascade }
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.references :booked_by_resource, polymorphic: true
      t.timestamps null: false
    end

    create_table :campaign_assessor_assessments do |t|
      t.references :campaign, foreign_key: { on_delete: :cascade }
      t.references :assessment, foreign_key: { on_delete: :cascade }
      t.timestamps null: false
    end

    add_column :campaign_assessments, :workshop_activity, :boolean, default: false, null: false
  end
end

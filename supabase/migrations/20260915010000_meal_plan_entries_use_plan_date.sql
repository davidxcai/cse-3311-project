-- Replace the abstract day_of_week slot with a real calendar date, so a plan
-- can span multiple weeks and be shifted by any number of days instead of
-- only ever representing "the current perpetual week".
alter table meal_plan_entries add column plan_date date;

-- Backfill: anchor each row's day_of_week (0=Sun..6=Sat) to the calendar
-- week containing the migration run date.
update meal_plan_entries
set plan_date = current_date - extract(dow from current_date)::int + day_of_week;

alter table meal_plan_entries alter column plan_date set not null;

alter table meal_plan_entries drop constraint meal_plan_entries_pkey;
alter table meal_plan_entries add primary key (user_id, plan_date);

alter table meal_plan_entries drop column day_of_week;

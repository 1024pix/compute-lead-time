# compute-lead-time

This is a simple script to save all transitions of a Jira Issues to a PostgreSQL database.

Transitions are the changes of status of an issue. 
For example, when an issue is created, it is in the status `To Do`. When it is moved to `In Progress`, it is a transition.

## How to use

1. Install the requirements:
```bash
npm ci
```

2. Copy `sample.env` and fill the variables:
```bash
cp sample.env .env
```

For the password, you need to create an API Token at this url : https://id.atlassian.com/manage-profile/security/api-tokens

3. Run the script:
```bash
node --env-file=.env index.js
```

## SQL Usage Example

```sql
with age as (select t1."issueId",t1.destination as status, sum(age(t2.timestamp, t1.timestamp)) as duration
from transitions t1
inner join transitions t2 on t1.destination = t2.source and t1."issueId" = t2."issueId" group by t1."issueId", status)
select status, extract(epoch from percentile_disc(0.5) within group (order by duration)) / 86400 AS age_in_days 
from age
where status in ('Ready for dev', 'Doing', 'Tech/Func Review', 'Deployed on Integration', 'Deployed on Recette') and extract(epoch from duration) > 0
group by status 
order by position(status::text in 'Ready for dev, Doing, Tech/Func Review, Deployed on Integration, Deployed on Recette');
```
